# 如何製作輪播 carousel 1【 carousel | 我不會寫 React Component 】

## About

輪播透過類似幻燈片的方式接連展示一部份的物件。

通常輪播一次只會呈現一張幻燈片，  
用戶可以控制輪播的當前幻燈片像是往前一張或是往後一張。

在部分實作，切換幻燈片會在頁面載入後自動開始，  
他也可能會在幻燈片都播放一遍後自動停止。

幻燈片可以包含任何形式的資訊，像是文字或圖片。
確保所有的用戶可以簡單的控制，且不會因為幻燈片輪播而產生負面影響。

## 詞彙

以下是輪播會用到的一些詞彙。

- **Slide 幻燈片**
  單個內容用於輪播。

- **Rotation Control 輪播控制**
  可交互元素用於暫停或是開啟自動輪播。

- **Next Slide Control 下張幻燈片控制**
  可交互元素，用於更換下張幻燈片。

- **Previous Slide Control 上張幻燈片控制**
  可交互元素，用於更換上張幻燈片。

- **Slide Picker Controls 幻燈片選擇**
  通常會用小點作為樣式，用戶可以選擇要看哪張幻燈片。

## Spec: role="region"

輪播需要帶有 `role="region"`，且必須要有 `aria-label` 或是 `aria-labelledby`。

```tsx
it("defines the carousel and its controls as a landmark region", () => {
  render(<Carousel aria-label="test" />);
  expect(screen.queryByRole("region")).toBeInTheDocument();
});

it("provides a label that describes the content in the carousel region", () => {
  render(<Carousel aria-label="test" />);
  expect(screen.queryByRole("region")).toHaveAccessibleName();
});

it('informs assistive technologies to identify the element as a "carousel" rather than a "region"', () => {
  render(<Carousel aria-label="test" />);
  expect(screen.queryByRole("region")).toHaveAttribute(
    "aria-roledescription",
    "carousel"
  );
});
```

### Solution

`section` 元素如果有可達性名稱會有隱含的 `region` landmark。

透過 `aria-roledescription` 客製化 landmark，
讓輔助科技識別這個元件時識別為 `carousel`。

```tsx
type CarouselProps = PCP<"section", {}>;
export function Carousel(props: CarouselProps) {
  return <section aria-roledescription="carousel" {...props} />;
}
```

## Spec: Item

```tsx
function setup() {
  render(
    <Carousel aria-label="test">
      <Carousel.Item>Dynamic Europe: Amsterdam, Prague, Berlin</Carousel.Item>
      <Carousel.Item>Travel to Southwest England and Paris</Carousel.Item>
      <Carousel.Item>Great Children's Programming on Public TV</Carousel.Item>
      <Carousel.Item>Foyle’s War Revisited</Carousel.Item>
      <Carousel.Item>Great Britain Vote: 7 pm Sat.</Carousel.Item>
      <Carousel.Item>Mid-American Gardener: Thursdays at 7 pm</Carousel.Item>
    </Carousel>
  );
}
```

```tsx
it("enables assistive technology users to perceive the boundaries of a slide.", () => {
  setup();
  expect(
    screen.getByText("Dynamic Europe: Amsterdam, Prague, Berlin")
  ).toHaveAttribute("role", "group");
  expect(
    screen.getByText("Travel to Southwest England and Paris")
  ).toHaveAttribute("role", "group");
  expect(
    screen.getByText("Great Children's Programming on Public TV")
  ).toHaveAttribute("role", "group");
  expect(screen.getByText("Foyle’s War Revisited")).toHaveAttribute(
    "role",
    "group"
  );
  expect(screen.getByText("Great Britain Vote: 7 pm Sat.")).toHaveAttribute(
    "role",
    "group"
  );
  expect(
    screen.getByText("Mid-American Gardener: Thursdays at 7 pm")
  ).toHaveAttribute("role", "group");
});

it('informs assistive technologies to identify the element as a "slide" rather than a "group"', () => {
  setup();
  expect(
    screen.getByText("Dynamic Europe: Amsterdam, Prague, Berlin")
  ).toHaveAttribute("aria-roledescription", "slide");
  expect(
    screen.getByText("Travel to Southwest England and Paris")
  ).toHaveAttribute("aria-roledescription", "slide");
  expect(
    screen.getByText("Great Children's Programming on Public TV")
  ).toHaveAttribute("aria-roledescription", "slide");
  expect(screen.getByText("Foyle’s War Revisited")).toHaveAttribute(
    "aria-roledescription",
    "slide"
  );
  expect(screen.getByText("Great Britain Vote: 7 pm Sat.")).toHaveAttribute(
    "aria-roledescription",
    "slide"
  );
  expect(
    screen.getByText("Mid-American Gardener: Thursdays at 7 pm")
  ).toHaveAttribute("aria-roledescription", "slide");
});
```

### Solution

這邊用到 compound component，  
想了解詳細可以看 [如何製作月曆 compound components【 calendar | 我不會寫 React Component 】](./calendar/compound-components.md)。

```tsx
type ItemProps = PCP<"div", {}>;
function Item(props: ItemProps) {
  return <div role="group" aria-roledescription="slide" {...props} />;
}

// ...

Carousel.Item = Item;
```

## Spec: Item Label

```tsx
it(
  "provides each slide with a distinct label " +
    "that helps the user understand which of the 6 slides is displayed.",
  () => {
    setup();
    expect(
      screen.getByText("Dynamic Europe: Amsterdam, Prague, Berlin")
    ).toHaveAccessibleName("1 of 6");
    expect(
      screen.getByText("Travel to Southwest England and Paris")
    ).toHaveAccessibleName("2 of 6");
    expect(
      screen.getByText("Great Children's Programming on Public TV")
    ).toHaveAccessibleName("3 of 6");
    expect(screen.getByText("Foyle’s War Revisited")).toHaveAccessibleName(
      "4 of 6"
    );
    expect(
      screen.getByText("Great Britain Vote: 7 pm Sat.")
    ).toHaveAccessibleName("5 of 6");
    expect(
      screen.getByText("Mid-American Gardener: Thursdays at 7 pm")
    ).toHaveAccessibleName("6 of 6");
  }
);
```

### Solution

先過濾出 `Item` 在動態產生 `label`。

```tsx
type CarouselProps = PCP<"section", {}>;
export function Carousel(props: CarouselProps) {
  const items: ReturnType<typeof Item>[] = [];
  Children.forEach(props.children, (element) => {
    if (isValidElement(element) && element.type === Item) {
      items.push(element);
    }
  });

  const defaultItemLabel = (index: number) => `${index + 1} of ${items.length}`;

  return (
    <section aria-roledescription="carousel" {...props}>
      {items.map((item, index) =>
        cloneElement(item, {
          key: defaultItemLabel(index),
          "aria-label": defaultItemLabel(index),
          ...item.props,
        })
      )}
    </section>
  );
}
```

## Spec: aria-live

```tsx
function setup() {
  render(
    <Carousel aria-label="test">
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
describe("aria-live", () => {
  it("applied to a div element that contains all the slides", () => {
    setup();
    expect(
      screen.getByText("Dynamic Europe: Amsterdam, Prague, Berlin")
        .parentElement
    ).toHaveAttribute("aria-live");
  });
});
```

### Solution

將原本在 `Carousel` 的邏輯抽出，搬到 `Items` 元件下。

```tsx
type ItemsProps = PCP<"div", {}>;
function Items(props: ItemsProps) {
  const items: ReturnType<typeof Item>[] = [];
  Children.forEach(props.children, (element) => {
    if (isValidElement(element) && element.type === Item) {
      items.push(element);
    }
  });

  const defaultItemLabel = (index: number) => `${index + 1} of ${items.length}`;
  return (
    <div aria-live="off">
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

type CarouselProps = PCP<"section", {}>;
export function Carousel(props: CarouselProps) {
  return <section aria-roledescription="carousel" {...props} />;
}

Carousel.Items = Items;
```
