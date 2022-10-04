# 如何製作手風琴 accordion 2【 我不會寫 React Component 】

本篇接續前篇 [如何製作手風琴 accordion 1【 accordion | 我不會寫 React Component 】](./accordion-1.md)  
可以先看完上一篇再接續此篇。

## Spec: allows only one panel expanded at once

部分實作限制，同一時間只能有一個 `panel` 可以展開。

```tsx
it(
  "if the implementation allows only one panel to be expanded, " +
    "and if another panel is expanded, collapses that panel.",
  async () => {
    user.setup();
    render(
      <Accordion>
        <Accordion.Item>
          <Accordion.Header>Personal Information</Accordion.Header>
          <Accordion.Panel>test content 1</Accordion.Panel>
        </Accordion.Item>
        <Accordion.Item>
          <Accordion.Header>Billing Address</Accordion.Header>
          <Accordion.Panel>test content 2</Accordion.Panel>
        </Accordion.Item>
        <Accordion.Item>
          <Accordion.Header>Shipping Address</Accordion.Header>
          <Accordion.Panel>test content 3</Accordion.Panel>
        </Accordion.Item>
      </Accordion>
    );

    expect(screen.queryByText("test content 1")).toBeInTheDocument();
    expect(screen.queryByText("test content 2")).not.toBeInTheDocument();
    expect(screen.queryByText("test content 3")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Billing Address" }));
    expect(screen.queryByText("test content 1")).not.toBeInTheDocument();
    expect(screen.queryByText("test content 2")).toBeInTheDocument();
    expect(screen.queryByText("test content 3")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Shipping Address" }));
    expect(screen.queryByText("test content 1")).not.toBeInTheDocument();
    expect(screen.queryByText("test content 2")).not.toBeInTheDocument();
    expect(screen.queryByText("test content 3")).toBeInTheDocument();
  }
);
```

### Solution

我們需要一個 `Context` 讓多個 `Accordion.Item` 共享同一狀態。

因為需求要求一次只能開一個，先用 `SingleState` 封裝這個邏輯。

```tsx
interface SingleState {
  expand?: string;
  setExpand: (expand?: string) => void;
}
const Context = createContext<SingleState | null>(null);
```

透過 `id` 判斷當前開啟的 `panel` 是哪個。  
但我希望用戶也可以透過 `props` 自行決定 `id`，  
所以前面會先將 `id` 全部擷取出來。

`useState` 預設為第一個 `id`。

```tsx
type SingleProps = {
  children?: ReactNode;
};
function Single(props: SingleProps) {
  const id = useId();

  const ids: string[] = [];
  Children.forEach(props.children, (element, index) => {
    if (isValidElement(element) && element.type === Item) {
      ids.push(element.props.id ?? id + index);
    }
  });

  const [expand, _setExpand] = useState<string | undefined>(ids[0]);

  const setExpand = (id?: string) => {
    if (expand !== id) _setExpand(id);
  };

  return (
    <Context.Provider value={{ expand, setExpand }}>
      {Children.map(props.children, (element) => {
        if (isValidElement(element) && element.type === Item) {
          return cloneElement(element, { id: ids.shift(), ...element.props });
        }

        return element;
      })}
    </Context.Provider>
  );
}
```

`Accordion` 用戶可以透過 `type` 決定要起用哪個邏輯，  
這裡先只用 `Single`。

```tsx
type AccordionProps = {
  type?: "single";
  children?: ReactNode;
};
export function Accordion(props: AccordionProps) {
  return <Single>{props.children}</Single>;
}
```

我希望 `useItemContext` 能夠解耦，以便應用在更多情況。  
所以調整成 `context` 由參數拋入。

```tsx
export function useContextWithError<T>(context: Context<T>, error: string) {
  const _context = useContext(context);
  if (!_context) {
    throw new Error(error);
  }
  return _context;
}

function useItemContext(error: string) {
  return useContextWithError(ItemContext, error);
}

function useContext(error: string) {
  return useContextWithError(Context, error);
}
```

`Item` 接上了 `context`，並將 `open` 跟 `toggle` 邏輯改變成

```tsx
type ItemProps = {
  id?: string;
  children?: ReactNode;
  open?: boolean;
};
function Item(props: ItemProps) {
  const context = useContext(
    `<Accordion.Item /> cannot be rendered outside <Accordion />`
  );
  const id = {
    controls: props.id + "controls",
    labelledby: props.id + "labelledby",
  };
  const open = context.expand === props.id;
  const toggle = () => context.setExpand(props.id);
  return (
    <ItemContext.Provider value={{ open, toggle, id }}>
      {props.children}
    </ItemContext.Provider>
  );
}
```

## Spec: space / enter to expands

當用戶當前對焦在 `Accordion` 的 `header` 按鈕上，  
按下 <kbd>Enter</kbd> 或是 <kbd>Space</kbd> 時，  
其對應的 `panel` 也要被展開。

```tsx
describe("when focus is on the accordion header of a collapsed section, expands the section", () => {
  it("enter", async () => {
    user.setup();
    render(
      <Accordion>
        <Accordion.Item>
          <Accordion.Header>Personal Information</Accordion.Header>
          <Accordion.Panel>test content</Accordion.Panel>
        </Accordion.Item>
        <Accordion.Item>
          <Accordion.Header>Billing Address</Accordion.Header>
          <Accordion.Panel>test content 2</Accordion.Panel>
        </Accordion.Item>
      </Accordion>
    );

    expect(screen.queryByText("test content 2")).not.toBeInTheDocument();
    screen.getByRole("button", { name: "Billing Address" }).focus();
    await user.keyboard("{enter}");
    expect(screen.queryByText("test content 2")).toBeInTheDocument();
  });

  it("space", async () => {
    user.setup();
    render(
      <Accordion>
        <Accordion.Item>
          <Accordion.Header>Personal Information</Accordion.Header>
          <Accordion.Panel>test content</Accordion.Panel>
        </Accordion.Item>
        <Accordion.Item>
          <Accordion.Header>Billing Address</Accordion.Header>
          <Accordion.Panel>test content 2</Accordion.Panel>
        </Accordion.Item>
      </Accordion>
    );

    expect(screen.queryByText("test content 2")).not.toBeInTheDocument();
    screen.getByRole("button", { name: "Billing Address" }).focus();
    await user.keyboard(" ");
    expect(screen.queryByText("test content 2")).toBeInTheDocument();
  });
});
```

### Solution

只有焦點是當前元件才需要進行判斷。  
瀏覽器預設 <kbd>Enter</kbd> 會觸發 `onClick`，  
故這邊只需額外處理 <kbd>Space</kbd>。

```tsx
function Header(props: HeaderProps) {
  const context = useItemContext(
    `<Accordion.Header /> cannot be rendered outside <Accordion />`
  );
  const Comp = props.as ?? "h2";

  const ref = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const keydown = (event: KeyboardEvent) => {
      if (document.activeElement !== ref.current) return;

      if (event.code === "Space") {
        event.preventDefault();
        context.toggle();
      }
    };
    window.addEventListener("keydown", keydown);
    return () => window.removeEventListener("keydown", keydown);
  }, [context.toggle]);

  return (
    <Comp>
      <button
        ref={ref}
        type="button"
        id={context.id.labelledby}
        aria-expanded={context.open}
        aria-controls={context.id.controls}
        onClick={context.toggle}
      >
        {props.children}
      </button>
    </Comp>
  );
}
```

## Spec: collapse

部分實作要求一定至少要有一個 `panel` 是展開的，  
透過 `Accordion` 的 `collapse` 參數，用戶可以決定 `Accordion` 是否可以自由收合。

```tsx
describe(
  "some implementations require one panel to be expanded at all times " +
    "and allow only one panel to be expanded; " +
    "so, they do not support a collapse function.",
  () => {
    it("accordion without `collapse` attribute require one panel expanded at all time", async () => {
      user.setup();
      render(
        <Accordion>
          <Accordion.Item>
            <Accordion.Header>Personal Information</Accordion.Header>
            <Accordion.Panel>test content 1</Accordion.Panel>
          </Accordion.Item>
          <Accordion.Item>
            <Accordion.Header>Billing Address</Accordion.Header>
            <Accordion.Panel>test content 2</Accordion.Panel>
          </Accordion.Item>
        </Accordion>
      );

      expect(screen.queryByText("test content 1")).toBeInTheDocument();
      await user.click(screen.getByText("Personal Information"));
      expect(screen.queryByText("test content 1")).toBeInTheDocument();

      await user.click(screen.getByText("Billing Address"));
      expect(screen.queryByText("test content 1")).not.toBeInTheDocument();
      expect(screen.queryByText("test content 2")).toBeInTheDocument();
      await user.click(screen.getByText("Billing Address"));
      expect(screen.queryByText("test content 1")).not.toBeInTheDocument();
      expect(screen.queryByText("test content 2")).toBeInTheDocument();
    });

    it("accordion with `collapse` attribute can collapse", async () => {
      user.setup();
      render(
        <Accordion collapse>
          <Accordion.Item>
            <Accordion.Header>Personal Information</Accordion.Header>
            <Accordion.Panel>test content 1</Accordion.Panel>
          </Accordion.Item>
          <Accordion.Item>
            <Accordion.Header>Billing Address</Accordion.Header>
            <Accordion.Panel>test content 2</Accordion.Panel>
          </Accordion.Item>
        </Accordion>
      );

      expect(screen.queryByText("test content 1")).toBeInTheDocument();
      await user.click(screen.getByText("Personal Information"));
      expect(screen.queryByText("test content 1")).not.toBeInTheDocument();

      await user.click(screen.getByText("Billing Address"));
      expect(screen.queryByText("test content 2")).toBeInTheDocument();
      await user.click(screen.getByText("Billing Address"));
      expect(screen.queryByText("test content 2")).not.toBeInTheDocument();
    });
  }
);
```

### Solution

部分 `props` 的型別可以共用。

```tsx
type BaseProps = {
  collapse?: boolean;
  children?: ReactNode;
};
```

`collapse` 直接拋入到子元件。

```tsx
type AccordionProps = BaseProps & {
  type?: "single";
};
export function Accordion(props: AccordionProps) {
  return <Single collapse={props.collapse}>{props.children}</Single>;
}
```

透過 `setExpand` 根據邏輯判斷即可。

```tsx
type SingleProps = BaseProps;
function Single(props: SingleProps) {
  const id = useId();

  const ids: string[] = [];
  Children.forEach(props.children, (element, index) => {
    if (isValidElement(element) && element.type === Item) {
      ids.push(element.props.id ?? id + index);
    }
  });

  const [expand, _setExpand] = useState<string | undefined>(ids[0]);

  const setExpand = (id?: string) => {
    if (props.collapse) {
      return _setExpand(expand === id ? undefined : id);
    }

    if (expand !== id) {
      return _setExpand(id);
    }
  };

  return (
    <Context.Provider value={{ expand, setExpand }}>
      {Children.map(props.children, (element) => {
        if (isValidElement(element) && element.type === Item) {
          return cloneElement(element, { id: ids.shift(), ...element.props });
        }

        return element;
      })}
    </Context.Provider>
  );
}
```

## Spec: tab / shift + tab

基於瀏覽器預設的表序列，我們不需要做任何的客製化。  
所以這邊僅提供測試。

```tsx
describe("tab", () => {
  it("moves focus to the next focusable element", async () => {
    user.setup();
    render(
      <Accordion>
        <Accordion.Item>
          <Accordion.Header>Personal Information</Accordion.Header>
          <Accordion.Panel>test content 1</Accordion.Panel>
        </Accordion.Item>
        <Accordion.Item>
          <Accordion.Header>Billing Address</Accordion.Header>
          <Accordion.Panel>test content 2</Accordion.Panel>
        </Accordion.Item>
        <Accordion.Item>
          <Accordion.Header>Shipping Address</Accordion.Header>
          <Accordion.Panel>test content 3</Accordion.Panel>
        </Accordion.Item>
      </Accordion>
    );

    await user.keyboard("{Tab}");
    expect(screen.getByText("Personal Information")).toHaveFocus();
    await user.keyboard("{Tab}");
    expect(screen.getByText("Billing Address")).toHaveFocus();
    await user.keyboard("{Tab}");
    expect(screen.getByText("Shipping Address")).toHaveFocus();
  });

  it("all focusable elements in the accordion are included in the page tab sequence", async () => {
    user.setup();
    render(
      <Accordion>
        <Accordion.Item>
          <Accordion.Header>Personal Information</Accordion.Header>
          <Accordion.Panel>
            <fieldset>
              <p>
                <label htmlFor="cufc1">
                  Name<span aria-hidden="true">*</span>:
                </label>
                <input
                  type="text"
                  name="Name"
                  id="cufc1"
                  aria-required="true"
                />
              </p>
              <p>
                <label htmlFor="cufc2">
                  Email<span aria-hidden="true">*</span>:
                </label>
                <input
                  type="text"
                  name="Email"
                  id="cufc2"
                  aria-required="true"
                />
              </p>
              <p>
                <label htmlFor="cufc3">Phone:</label>
                <input type="text" name="Phone" id="cufc3" />
              </p>
              <p>
                <label htmlFor="cufc4">Extension:</label>
                <input type="text" name="Ext" id="cufc4" />
              </p>
              <p>
                <label htmlFor="cufc5">Country:</label>
                <input type="text" name="Country" id="cufc5" />
              </p>
              <p>
                <label htmlFor="cufc6">City/Province:</label>
                <input type="text" name="City_Province" id="cufc6" />
              </p>
            </fieldset>
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>
    );

    await user.keyboard("{Tab}");
    expect(screen.getByText("Personal Information")).toHaveFocus();
    await user.keyboard("{Tab}");
    expect(screen.getByLabelText(/Name/)).toHaveFocus();
    await user.keyboard("{Tab}");
    expect(screen.getByLabelText(/Email/)).toHaveFocus();
    await user.keyboard("{Tab}");
    expect(screen.getByLabelText(/Phone/)).toHaveFocus();
    await user.keyboard("{Tab}");
    expect(screen.getByLabelText(/Extension/)).toHaveFocus();
    await user.keyboard("{Tab}");
    expect(screen.getByLabelText(/Country/)).toHaveFocus();
    await user.keyboard("{Tab}");
    expect(screen.getByLabelText(/City\/Province/)).toHaveFocus();
  });
});
```

```tsx
describe("shift + tab", () => {
  it("moves focus to the next focusable element", async () => {
    user.setup();
    render(
      <Accordion>
        <Accordion.Item>
          <Accordion.Header>Personal Information</Accordion.Header>
          <Accordion.Panel>test content 1</Accordion.Panel>
        </Accordion.Item>
        <Accordion.Item>
          <Accordion.Header>Billing Address</Accordion.Header>
          <Accordion.Panel>test content 2</Accordion.Panel>
        </Accordion.Item>
        <Accordion.Item>
          <Accordion.Header>Shipping Address</Accordion.Header>
          <Accordion.Panel>test content 3</Accordion.Panel>
        </Accordion.Item>
      </Accordion>
    );

    await user.keyboard("{Shift>}{Tab}{/Shift}");
    expect(screen.getByText("Shipping Address")).toHaveFocus();
    await user.keyboard("{Shift>}{Tab}{/Shift}");
    expect(screen.getByText("Billing Address")).toHaveFocus();
    await user.keyboard("{Shift>}{Tab}{/Shift}");
    expect(screen.getByText("Personal Information")).toHaveFocus();
  });

  it("all focusable elements in the accordion are included in the page tab sequence", async () => {
    user.setup();
    render(
      <Accordion>
        <Accordion.Item>
          <Accordion.Header>Personal Information</Accordion.Header>
          <Accordion.Panel>
            <fieldset>
              <p>
                <label htmlFor="cufc1">
                  Name<span aria-hidden="true">*</span>:
                </label>
                <input
                  type="text"
                  name="Name"
                  id="cufc1"
                  aria-required="true"
                />
              </p>
              <p>
                <label htmlFor="cufc2">
                  Email<span aria-hidden="true">*</span>:
                </label>
                <input
                  type="text"
                  name="Email"
                  id="cufc2"
                  aria-required="true"
                />
              </p>
              <p>
                <label htmlFor="cufc3">Phone:</label>
                <input type="text" name="Phone" id="cufc3" />
              </p>
              <p>
                <label htmlFor="cufc4">Extension:</label>
                <input type="text" name="Ext" id="cufc4" />
              </p>
              <p>
                <label htmlFor="cufc5">Country:</label>
                <input type="text" name="Country" id="cufc5" />
              </p>
              <p>
                <label htmlFor="cufc6">City/Province:</label>
                <input type="text" name="City_Province" id="cufc6" />
              </p>
            </fieldset>
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>
    );

    await user.keyboard("{Shift>}{Tab}{/Shift}");
    expect(screen.getByLabelText(/City\/Province/)).toHaveFocus();
    await user.keyboard("{Shift>}{Tab}{/Shift}");
    expect(screen.getByLabelText(/Country/)).toHaveFocus();
    await user.keyboard("{Shift>}{Tab}{/Shift}");
    expect(screen.getByLabelText(/Extension/)).toHaveFocus();
    await user.keyboard("{Shift>}{Tab}{/Shift}");
    expect(screen.getByLabelText(/Phone/)).toHaveFocus();
    await user.keyboard("{Shift>}{Tab}{/Shift}");
    expect(screen.getByLabelText(/Email/)).toHaveFocus();
    await user.keyboard("{Shift>}{Tab}{/Shift}");
    expect(screen.getByLabelText(/Name/)).toHaveFocus();
    await user.keyboard("{Shift>}{Tab}{/Shift}");
    expect(screen.getByText("Personal Information")).toHaveFocus();
  });
});
```
