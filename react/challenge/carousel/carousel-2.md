# 如何製作輪播 carousel 2【 carousel | 我不會寫 React Component 】

本篇接續前篇 [如何製作輪播 carousel 1【 carousel | 我不會寫 React Component 】](./carousel-1.md)  
可以先看完上一篇再接續此篇。

## Screen Reader Announcement of Slide Changes

當自動輪播沒有啟用，輪播的幻燈片內容必須被包含進 `live region` 內，  
以便讓輔助科技搜尋輪播幻燈片的內容。

當用戶觸發下張或是上張幻燈片的按鈕時，新的幻燈片會發出通知，
用戶可以得到立即反饋來幫助他們決定是否要對新的內容進行操作。

最重要的，當自動輪播被開啟時，`live region` 必須關閉。  
如果沒有的話，頁面的通知會變得很不穩定，因為會不斷出現新的插播阻礙用戶當前閱讀。

## Spec: Button

我們需要按鈕用於控制，像是 下張/上張 幻燈片，或是 停止/開啟 自動輪播 等功能。

```tsx
function setup() {
  render(
    <Carousel aria-label="Highlighted television shows">
      <Carousel.Button>pause auto-rotation</Carousel.Button>
      <Carousel.Button>next slide</Carousel.Button>
      <Carousel.Button>previous slide</Carousel.Button>
      <Carousel.Items>
        <Carousel.Item>Dynamic Europe: Amsterdam, Prague, Berlin</Carousel.Item>
        <Carousel.Item>Travel to Southwest England and Paris</Carousel.Item>
        <Carousel.Item>Great Children's Programming on Public TV</Carousel.Item>
        <Carousel.Item>Foyle’s War Revisited</Carousel.Item>
        <Carousel.Item>Great Britain Vote: 7 pm Sat.</Carousel.Item>
        <Carousel.Item>Mid-American Gardener: Thursdays at 7 pm</Carousel.Item>
      </Carousel.Items>
    </Carousel>
  );
}
```

```tsx
it("defines the accessible name for the pause auto-rotation button", () => {
  setup();
  expect(
    screen.queryByRole("button", { name: "pause auto-rotation" })
  ).toBeInTheDocument();
});

it("and the next and previous slide buttons", () => {
  setup();
  expect(
    screen.queryByRole("button", { name: "next slide" })
  ).toBeInTheDocument();
  expect(
    screen.queryByRole("button", { name: "previous slide" })
  ).toBeInTheDocument();
});
```

### Solution

```tsx
type ButtonProps = PCP<"button", {}>;
function Button(props: ButtonProps) {
  return <button type="button" {...props} />;
}

// ...

Carousel.Button = Button;
```

## Spec: aria-controls

更換幻燈片的按鈕要標注其控制的元素為何。

```tsx
it("identifies the content on the page that the button controls", () => {
  setup();
  const id = screen.getByText("Dynamic Europe: Amsterdam, Prague, Berlin")
    .parentElement?.id;
  expect(id).not.toBeFalsy();
  expect(screen.queryByRole("button", { name: "next slide" })).toHaveAttribute(
    "aria-controls",
    id
  );
  expect(
    screen.queryByRole("button", { name: "previous slide" })
  ).toHaveAttribute("aria-controls", id);
});
```

### Solution

這邊用到了 compound components，  
有興趣可以看 [如何製作月曆 compound components【 calendar | 我不會寫 React Component 】](./calendar/compound-components.md)。

```tsx
interface State {
  items_id: string;
}
const Context = createContext<State | null>(null);
function useCarouselContext(error: string) {
  return useContextWithError(Context, error);
}
```

建立共用 `id`。

```tsx
export function Carousel(props: CarouselProps) {
  const id = useId();
  const context = {
    items_id: id + "items",
  };
  return (
    <Context.Provider value={context}>
      <section aria-roledescription="carousel" {...props} />
    </Context.Provider>
  );
}
```

```tsx
function Button(props: ButtonProps) {
  const context = useCarouselContext(
    `<Carousel.Button /> cannot be rendered outside <Carousel />`
  );
  return <button type="button" aria-controls={context.items_id} {...props} />;
}
```

```tsx
function Items(props: ItemsProps) {
  const context = useCarouselContext(
    `<Carousel.Items /> cannot be rendered outside <Carousel />`
  );

  const items: ReturnType<typeof Item>[] = [];
  Children.forEach(props.children, (element) => {
    if (isValidElement(element) && element.type === Item) {
      items.push(element);
    }
  });

  const defaultItemLabel = (index: number) => `${index + 1} of ${items.length}`;
  return (
    <div aria-live="off" id={context.items_id}>
      {items.map((item, index) =>
        cloneElement(item, {
          key: defaultItemLabel(index),
          "aria-label": defaultItemLabel(index),
          ...item.props,
        })
      )}
    </div>
  );
}
```

## Spec: control slide

用戶可以透過 下張跟上張的按鈕 控制 更換幻燈片。

```tsx
describe("users can use the previous and next buttons to manually navigate through the slides", () => {
  it("next slide", async () => {
    setup();
    expect(screen.getByRole("group")).toHaveAccessibleName("1 of 6");
    await user.click(screen.getByRole("button", { name: "next slide" }));
    expect(screen.getByRole("group")).toHaveAccessibleName("2 of 6");
    await user.click(screen.getByRole("button", { name: "next slide" }));
    expect(screen.getByRole("group")).toHaveAccessibleName("3 of 6");
    await user.click(screen.getByRole("button", { name: "next slide" }));
    expect(screen.getByRole("group")).toHaveAccessibleName("4 of 6");
    await user.click(screen.getByRole("button", { name: "next slide" }));
    expect(screen.getByRole("group")).toHaveAccessibleName("5 of 6");
    await user.click(screen.getByRole("button", { name: "next slide" }));
    expect(screen.getByRole("group")).toHaveAccessibleName("6 of 6");
    await user.click(screen.getByRole("button", { name: "next slide" }));
    expect(screen.getByRole("group")).toHaveAccessibleName("1 of 6");
  });

  it("previous slide", async () => {
    setup();
    expect(screen.getByRole("group")).toHaveAccessibleName("1 of 6");
    await user.click(screen.getByRole("button", { name: "previous slide" }));
    expect(screen.getByRole("group")).toHaveAccessibleName("6 of 6");
    await user.click(screen.getByRole("button", { name: "previous slide" }));
    expect(screen.getByRole("group")).toHaveAccessibleName("5 of 6");
    await user.click(screen.getByRole("button", { name: "previous slide" }));
    expect(screen.getByRole("group")).toHaveAccessibleName("4 of 6");
    await user.click(screen.getByRole("button", { name: "previous slide" }));
    expect(screen.getByRole("group")).toHaveAccessibleName("3 of 6");
    await user.click(screen.getByRole("button", { name: "previous slide" }));
    expect(screen.getByRole("group")).toHaveAccessibleName("2 of 6");
    await user.click(screen.getByRole("button", { name: "previous slide" }));
    expect(screen.getByRole("group")).toHaveAccessibleName("1 of 6");
  });
});
```

### Solution

我們需要設有一個數值用於表示當前顯示的幻燈片是哪一張。  
以及切換上一張跟下一張的功能。

```tsx
interface State {
  items_id: string;
  index: number;
  next: () => void;
  prev: () => void;
}
```

透過 `reducer` 控制當前 `index`。

```tsx
function reducer(counter: number, action: "asc" | "desc") {
  if (action === "asc") return counter + 1;
  if (action === "desc") return counter - 1;
  return counter;
}
```

```tsx
export function Carousel(props: CarouselProps) {
  const id = useId();
  const [index, dispatch] = useReducer(reducer, 0);
  const next = () => dispatch("asc");
  const prev = () => dispatch("desc");
  const context = {
    items_id: id + "items",
    index,
    next,
    prev,
  };
  return (
    <Context.Provider value={context}>
      <section aria-roledescription="carousel" {...props} />
    </Context.Provider>
  );
}
```

按鈕這邊設有 `action` 讓用戶可以決定該按鈕是切換到上一張或是下一張。

```tsx
type ButtonAction = "next" | "prev";
type ButtonProps = PCP<
  "button",
  {
    action?: ButtonAction;
  }
>;
function Button(props: ButtonProps) {
  const context = useCarouselContext(
    `<Carousel.Button /> cannot be rendered outside <Carousel />`
  );
  const onClick = () => {
    if (props.action === "next") context.next();
    if (props.action === "prev") context.prev();
  };
  return (
    <button
      type="button"
      aria-controls={context.items_id}
      onClick={onClick}
      {...props}
    />
  );
}
```

```tsx
function setup() {
  user.setup();
  render(
    <Carousel aria-label="Highlighted television shows">
      <Carousel.Button>pause auto-rotation</Carousel.Button>
      <Carousel.Button action="next">next slide</Carousel.Button>
      <Carousel.Button action="prev">previous slide</Carousel.Button>
      <Carousel.Items>
        <Carousel.Item>Dynamic Europe: Amsterdam, Prague, Berlin</Carousel.Item>
        <Carousel.Item>Travel to Southwest England and Paris</Carousel.Item>
        <Carousel.Item>Great Children's Programming on Public TV</Carousel.Item>
        <Carousel.Item>Foyle’s War Revisited</Carousel.Item>
        <Carousel.Item>Great Britain Vote: 7 pm Sat.</Carousel.Item>
        <Carousel.Item>Mid-American Gardener: Thursdays at 7 pm</Carousel.Item>
      </Carousel.Items>
    </Carousel>
  );
}
```

透過 `circular` 函式，拋入的數字會被限制在 `min` 到 `max` 中間循環。

```tsx
function mod(max: number, value: number) {
  return ((value % max) + max) % max;
}

function circular(min: number, max: number, value: number) {
  return mod(max - min + 1, value - min) + min;
}

function Items(props: ItemsProps) {
  const context = useCarouselContext(
    `<Carousel.Items /> cannot be rendered outside <Carousel />`
  );

  const items: ReturnType<typeof Item>[] = [];
  Children.forEach(props.children, (element) => {
    if (isValidElement(element) && element.type === Item) {
      items.push(element);
    }
  });

  const defaultItemLabel = (index: number) => `${index + 1} of ${items.length}`;
  return (
    <div aria-live="off" id={context.items_id}>
      {items.map((item, index) =>
        cloneElement(item, {
          key: defaultItemLabel(index),
          "aria-label": defaultItemLabel(index),
          hidden:
            circular(0, items.length - 1, context.index) !== index
              ? true
              : undefined,
          ...item.props,
        })
      )}
    </div>
  );
}
```

因為我們一次只顯示一個幻燈片，  
故需要調整前面的測試。

```tsx
it(
  "provides each slide with a distinct label " +
    "that helps the user understand which of the 6 slides is displayed.",
  async () => {
    setup();
    expect(
      screen.getByText("Dynamic Europe: Amsterdam, Prague, Berlin")
    ).toHaveAccessibleName("1 of 6");
    await user.click(screen.getByRole("button", { name: "next slide" }));
    expect(
      screen.getByText("Travel to Southwest England and Paris")
    ).toHaveAccessibleName("2 of 6");
    await user.click(screen.getByRole("button", { name: "next slide" }));
    expect(
      screen.getByText("Great Children's Programming on Public TV")
    ).toHaveAccessibleName("3 of 6");
    await user.click(screen.getByRole("button", { name: "next slide" }));
    expect(screen.getByText("Foyle’s War Revisited")).toHaveAccessibleName(
      "4 of 6"
    );
    await user.click(screen.getByRole("button", { name: "next slide" }));
    expect(
      screen.getByText("Great Britain Vote: 7 pm Sat.")
    ).toHaveAccessibleName("5 of 6");
    await user.click(screen.getByRole("button", { name: "next slide" }));
    expect(
      screen.getByText("Mid-American Gardener: Thursdays at 7 pm")
    ).toHaveAccessibleName("6 of 6");
  }
);
```
