# 如何製作手風琴 accordion 1【 accordion | 我不會寫 React Component 】

## About

手風琴是一排垂直堆疊且用戶可以進行操作的標頭，  
標頭內容可以包含像是標題，簡短內容，縮圖 可以用來表示其內容。

用戶可以透過標頭控制哪個段落的內容要顯示或是隱藏。

這個元件通常被使用在該頁面有多個段落，為了減少用戶需要的滑動動作之情況。

手風琴主要包含兩個部分： **Header**，**Panel**。

## Spec: role="button"

每個手風琴標頭都要包含一個帶有 `role="button"` 的元素。

```tsx
it("the title of each accordion header is contained in an element with role button", () => {
  render(
    <Accordion>
      <Accordion.Item>
        <Accordion.Header>Personal Information</Accordion.Header>
      </Accordion.Item>
    </Accordion>
  );

  expect(
    screen.queryByRole("button", { name: "Personal Information" })
  ).toBeInTheDocument();
});
```

### Solution

這邊用到 compound component，  
想了解詳細可以看 [如何製作月曆 compound components【 calendar | 我不會寫 React Component 】](./calendar/compound-components.md)。

注意，`button` 記得標注 `type="button"`，  
因為沒有標注 `type` 的 `button` 在 `form` 底下會預設會是 `submit`。

```tsx
type ItemProps = {
  children?: ReactNode;
};
function Item(props: ItemProps) {
  return <>{props.children}</>;
}

type HeaderProps = {
  children?: ReactNode;
};
function Header(props: HeaderProps) {
  return <button type="button">{props.children}</button>;
}

type AccordionProps = {
  children?: ReactNode;
};
export function Accordion(props: AccordionProps) {
  return <>{props.children}</>;
}

Accordion.Item = Item;
Accordion.Header = Header;
```

## Spec: role="heading"

```tsx
describe(
  "each accordion header button is wrapped in an element with role heading" +
    "that has a value set for aria-level" +
    "that is appropriate for the information architecture of the page",
  () => {
    it(
      "if the native host language has an element with an implicit heading and aria-level, " +
        "such as an html heading tag, a native host language element may be used",
      () => {
        render(
          <Accordion>
            <Accordion.Item>
              <Accordion.Header as="h2">Personal Information</Accordion.Header>
            </Accordion.Item>
          </Accordion>
        );

        expect(
          screen.queryByRole("heading", {
            level: 2,
            name: "Personal Information",
          })
        ).toBeInTheDocument();
      }
    );

    it(
      "the button element is the only element inside the heading element. " +
        "that is, if there are other visually persistent elements, " +
        "they are not included inside the heading element",
      () => {
        render(
          <Accordion>
            <Accordion.Item>
              <Accordion.Header>Personal Information</Accordion.Header>
            </Accordion.Item>
          </Accordion>
        );

        expect(
          screen.queryByRole("heading", {
            level: 2,
            name: "Personal Information",
          })?.children
        ).toHaveLength(1);

        expect(
          screen.queryByRole("heading", {
            level: 2,
            name: "Personal Information",
          })?.children[0].tagName
        ).toMatch(/button/i);
      }
    );
  }
);
```

### Solution

透過 `PCP` 讓用戶可以自行決定要用什麼元素，預設為 `h2`。  
詳細可以見 [如何製作月曆 props【 calendar | 我不會寫 React Component 】](./calendar/props.md)。

```tsx
type HeaderProps = PCP<"h2", {}>;
function Header(props: HeaderProps) {
  const Comp = props.as ?? "h2";
  return (
    <Comp>
      <button type="button">{props.children}</button>
    </Comp>
  );
}
```

## Spec: aria-expanded

當手風琴其中一個 `panel` 被打開時，  
對應的 `header` 的 `button` 元素需要標注 `aria-expanded="true"`，  
如果 `panel` 隱藏，`aria-expanded="false"`。

```tsx
it(
  "if the accordion panel associated with an accordion header is visible, " +
    "the header button element has aria-expanded set to true. " +
    "if the panel is not visible, aria-expanded is set to false",
  async () => {
    user.setup();
    render(
      <Accordion>
        <Accordion.Item>
          <Accordion.Header>Personal Information</Accordion.Header>
          <Accordion.Panel>test content</Accordion.Panel>
        </Accordion.Item>
      </Accordion>
    );

    expect(
      screen.queryByRole("button", { name: "Personal Information" })
    ).toHaveAttribute("aria-expanded", "true");

    expect(screen.queryByText("test content")).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: "Personal Information" })
    );

    expect(screen.queryByText("test content")).not.toBeInTheDocument();
  }
);
```

### Solution

用 `Context` 共享同一個狀態。

```tsx
interface State {
  open: boolean;
  toggle: () => void;
}
const Context = createContext<State | null>(null);

function useItemContext(error: string) {
  const context = useContext(Context);
  if (!context) {
    throw new Error(error);
  }
  return context;
}

type ItemProps = {
  children?: ReactNode;
};
function Item(props: ItemProps) {
  const [open, setOpen] = useState(true);
  const toggle = () => setOpen(!open);
  return (
    <Context.Provider value={{ open, toggle }}>
      {props.children}
    </Context.Provider>
  );
}
```

```tsx
type HeaderProps = PCP<"h2", {}>;
function Header(props: HeaderProps) {
  const context = useItemContext(
    `<Accordion.Header /> cannot be rendered outside <Accordion />`
  );
  const Comp = props.as ?? "h2";
  return (
    <Comp>
      <button
        type="button"
        aria-expanded={context.open}
        onClick={context.toggle}
      >
        {props.children}
      </button>
    </Comp>
  );
}

type PanelProps = {
  children?: ReactNode;
};
function Panel(props: PanelProps) {
  const context = useItemContext(
    `<Accordion.Panel /> cannot be rendered outside <Accordion />`
  );
  return <div>{context.open && props.children}</div>;
}
```

## Spec: aria-controls

手風琴的按鈕要標注 `aria-controls`，其數值要對應 `panel` 的 `id`。

```tsx
it(
  "the accordion header button element has aria-controls " +
    "set to the id of the element containing the accordion panel content",
  () => {
    render(
      <Accordion>
        <Accordion.Item>
          <Accordion.Header>Personal Information</Accordion.Header>
          <Accordion.Panel data-testid="panel">test content</Accordion.Panel>
        </Accordion.Item>
      </Accordion>
    );
    expect(
      screen.getByRole("button", { name: "Personal Information" })
    ).toHaveAttribute("aria-controls", screen.getByTestId("panel").id);
  }
);
```

### Solution

透過 `Context` 共享同一個 `id`。

```tsx
interface State {
  open: boolean;
  toggle: () => void;
  id: string;
}
```

```tsx
function Item(props: ItemProps) {
  const [open, setOpen] = useState(true);
  const toggle = () => setOpen(!open);
  const id = useId();
  return (
    <Context.Provider value={{ open, toggle, id }}>
      {props.children}
    </Context.Provider>
  );
}
```

```tsx
function Header(props: HeaderProps) {
  const context = useItemContext(
    `<Accordion.Header /> cannot be rendered outside <Accordion />`
  );
  const Comp = props.as ?? "h2";
  return (
    <Comp>
      <button
        type="button"
        aria-expanded={context.open}
        aria-controls={context.id}
        onClick={context.toggle}
      >
        {props.children}
      </button>
    </Comp>
  );
}
```

```tsx
type PanelProps = PCP<"div", {}>;
function Panel(props: PanelProps) {
  const context = useItemContext(
    `<Accordion.Panel /> cannot be rendered outside <Accordion />`
  );
  return (
    <div {...props} id={context.id}>
      {context.open && props.children}
    </div>
  );
}
```

## Spec: role="region"

當前展開的 `panel` 需要標注 `role="region"`。  
[region] 用來告訴用戶這個段落有重要的內容。

```tsx
it("creates a landmark region that contains the currently expanded accordion panel", () => {
  render(
    <Accordion>
      <Accordion.Item>
        <Accordion.Header>Personal Information</Accordion.Header>
        <Accordion.Panel>test content</Accordion.Panel>
      </Accordion.Item>
    </Accordion>
  );

  expect(screen.getByRole("region")).toBeInTheDocument();
});
```

### Solution

```tsx
function Panel(props: PanelProps) {
  const context = useItemContext(
    `<Accordion.Panel /> cannot be rendered outside <Accordion />`
  );
  const role = context.open ? "region" : undefined;
  return (
    <div {...props} id={context.id} role={role}>
      {context.open && props.children}
    </div>
  );
}
```

## Spec: aria-labelledby

標注 `role="region"` 的元素，必須要標注 `aria-labelledby`，  
`aria-labelledby` 要對應 `button` 的 `id`。

```tsx
describe('aria-labelledby="IDREF"', () => {
  it("region elements are required to have an accessible name to be identified as a landmark", () => {
    render(
      <Accordion>
        <Accordion.Item>
          <Accordion.Header>Personal Information</Accordion.Header>
          <Accordion.Panel>test content</Accordion.Panel>
        </Accordion.Item>
      </Accordion>
    );

    expect(screen.getByRole("region")).toHaveAccessibleName(
      "Personal Information"
    );
  });

  it("references the accordion header button that expands and collapses the region", () => {
    render(
      <Accordion>
        <Accordion.Item>
          <Accordion.Header>Personal Information</Accordion.Header>
          <Accordion.Panel>test content</Accordion.Panel>
        </Accordion.Item>
      </Accordion>
    );

    expect(screen.getByRole("region")).toHaveAttribute(
      "aria-labelledby",
      screen.getByRole("button", { name: "Personal Information" }).id
    );
  });
});
```

### Solution

調整一下共享的 `id`。

```tsx
interface State {
  open: boolean;
  toggle: () => void;
  id: {
    controls: string;
    labelledby: string;
  };
}
```

拆做 `controls` 跟 `labelledby` 用的 `id`。

```tsx
function Item(props: ItemProps) {
  const [open, setOpen] = useState(true);
  const toggle = () => setOpen(!open);
  const _id = useId();
  const id = {
    controls: _id + "controls",
    labelledby: _id + "labelledby",
  };
  return (
    <Context.Provider value={{ open, toggle, id }}>
      {props.children}
    </Context.Provider>
  );
}
```

```tsx
function Header(props: HeaderProps) {
  const context = useItemContext(
    `<Accordion.Header /> cannot be rendered outside <Accordion />`
  );
  const Comp = props.as ?? "h2";
  return (
    <Comp>
      <button
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

```tsx
function Panel(props: PanelProps) {
  const context = useItemContext(
    `<Accordion.Panel /> cannot be rendered outside <Accordion />`
  );
  const role = context.open ? "region" : undefined;
  return (
    <div
      {...props}
      role={role}
      id={context.id.controls}
      aria-labelledby={context.id.labelledby}
    >
      {context.open && props.children}
    </div>
  );
}
```

## 名詞對照

| 中文   | 英文      |
| ------ | --------- |
| 手風琴 | accordion |
| 標頭   | heading   |

[region]: https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/region_role
