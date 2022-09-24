# 如何製作麵包屑 BreadCrumb【 breadcrumb | 我不會寫 React Component 】

hashtags: `#react`, `#components`, `#accessibility`, `#breadcrumb`

## Spec: Tag

麵包屑元件的列表部分要用 `ol` 標籤，並且最外層要用 `nav` 標籤。

```tsx
it("the set of links is structured using an ordered list", () => {
  render(<BreadCrumb />);
  expect(screen.getByRole("list").tagName).toMatch(/ol/i);
});

it(
  "a nav element labeled breadcrumb identifies the structure as a breadcrumb trail " +
    "and makes it a navigation landmark so that it is easy to locate.",
  () => {
    render(<BreadCrumb />);
    expect(screen.queryByRole("navigation")).toBeInTheDocument();
  }
);
```

### Solution

```tsx
export function BreadCrumb() {
  return (
    <nav>
      <ol></ol>
    </nav>
  );
}
```

## Spec: Separator

螢幕報讀不需要閱讀分隔符號，透過某些方式可以避免螢幕報讀閱讀到這個資訊，  
像是 `css` 或是 `aria-hidden`。

```tsx
describe("to prevent screen reader announcement of the visual separators between links", () => {
  it(
    "the separators are part of the visual presentation that signifies the breadcrumb trail, " +
      "which is already semantically represented by the nav element with its label of breadcrumb. " +
      "so, using a display technique that is not represented in the accessibility tree " +
      "used by screen readers prevents redundant and potentially distracting verbosity.",
    () => {
      setup();
      screen.getAllByText("/").forEach((item) => {
        expect(item).not.toHaveAccessibleName();
      });
    }
  );
});
```

這邊用到了 compound components，  
有興趣可以看 [如何製作月曆 compound components【 calendar | 我不會寫 React Component 】](./calendar/compound-components.md)。

```tsx
function setup() {
  render(
    <BreadCrumb separator="/">
      <BreadCrumb.Path href="../../">
        WAI-ARIA Authoring Practices
      </BreadCrumb.Path>
      <BreadCrumb.Path href="/WAI/ARIA/apg/patterns/">
        Design Patterns
      </BreadCrumb.Path>
      <BreadCrumb.Path href="/WAI/ARIA/apg/patterns/breadcrumb/">
        Breadcrumb Pattern
      </BreadCrumb.Path>
      <BreadCrumb.Path href="index.html">Breadcrumb Example</BreadCrumb.Path>
    </BreadCrumb>
  );
}
```

### Solution

`Path` 預設為 `a` 元素，但用戶可以透過 `as` 自由決定要渲染的元件。

```tsx
type PathProps<T extends ElementType = "a"> = PCP<T, {}>;
function Path<T extends ElementType = "a">(_props: PathProps<T>) {
  const { as, ...props } = _props;
  const Comp = as ?? "a";
  return <Comp {...props} />;
}
```

元件跟元件之間才需要分隔符，所以最後一個跳過。  
分隔符透過 `aria-hidden` 讓螢幕報讀知道這個不用念。

```tsx
type BreadCrumbProps = {
  separator?: ReactNode;
  children?: ReactNode;
};
export function BreadCrumb(props: BreadCrumbProps) {
  const maxLength = Children.count(props.children);
  const isLastElement = (index: number) => index === maxLength - 1;
  const separator = (index: number) => {
    if (props.separator && !isLastElement(index)) {
      return <li aria-hidden>{props.separator}</li>;
    }
    return null;
  };

  return (
    <nav>
      <ol>
        {Children.map(props.children, (element, index) => {
          if (!isValidElement(element) || element.type !== Path) return null;

          return (
            <>
              <li>{element}</li>
              {separator(index)}
            </>
          );
        })}
      </ol>
    </nav>
  );
}
```

## Spec: aria-label

元件需要帶有屬性 `aria-label` 來標記這個元件的名稱。

```tsx
describe('aria-label="Breadcrumb"', () => {
  it("provides a label that describes the type of navigation provided in the nav element", () => {
    setup();
    expect(screen.queryByRole("navigation")).toHaveAccessibleName(
      /BreadCrumb/i
    );
  });
});
```

### Solution

預設標籤名為 `Breadcrumb` 但用戶可以透過 `props` 進行覆寫。

```tsx
type _BreadCrumbProps = {
  separator?: ReactNode;
};
type BreadCrumbProps = PCP<"nav", _BreadCrumbProps>;
export function BreadCrumb(_props: BreadCrumbProps) {
  const { children, separator: _separator, ...props } = _props;

  const maxLength = Children.count(children);
  const isLastElement = (index: number) => index === maxLength - 1;
  const separator = (index: number) => {
    if (_separator && !isLastElement(index)) {
      return <li aria-hidden>{_separator}</li>;
    }
    return null;
  };

  return (
    <nav aria-label="Breadcrumb" {...props}>
      <ol>
        {Children.map(children, (element, index) => {
          if (!isValidElement(element) || element.type !== Path) return null;

          return (
            <>
              <li>{element}</li>
              {separator(index)}
            </>
          );
        })}
      </ol>
    </nav>
  );
}
```

## Spec: aria-current

麵包屑最後一個連結需要標注 `aria-current` 標記這是當前頁面的連結。

```tsx
describe('aria-current="page"', () => {
  it("applied to the last link in the set to indicate that it represents the current page", () => {
    setup();
    expect(screen.getAllByRole("link").at(-1)).toHaveAttribute(
      "aria-current",
      "page"
    );
  });
});
```

### Solution

雖然 `aria-current` 實際上要看是當前的網址是不是跟這個連結一致，  
這邊直覺的思考是判斷 [window.location][location]，  
但在 server-side render 沒有 `window` 這個物件，  
且各家的 `router` 實作可能不一樣，像是 `Next.js` 跟 `Remix (React-Router)`。  
故這邊不處理，由用戶端決定。

```tsx
function setup() {
  render(
    <BreadCrumb separator="/">
      <BreadCrumb.Path href="../../">
        WAI-ARIA Authoring Practices
      </BreadCrumb.Path>
      <BreadCrumb.Path href="/WAI/ARIA/apg/patterns/">
        Design Patterns
      </BreadCrumb.Path>
      <BreadCrumb.Path href="/WAI/ARIA/apg/patterns/breadcrumb/">
        Breadcrumb Pattern
      </BreadCrumb.Path>
      <BreadCrumb.Path href="index.html" current>
        Breadcrumb Example
      </BreadCrumb.Path>
    </BreadCrumb>
  );
}
```

```tsx
type PathProps<T extends ElementType = "a"> = PCP<
  T,
  {
    current?: boolean;
  }
>;
function Path<T extends ElementType = "a">(_props: PathProps<T>) {
  const { as, current, ...props } = _props;
  const Comp = as ?? "a";
  return <Comp aria-current={current ? "page" : undefined} {...props} />;
}
```

## 名詞對照

| 中文   | 英文        |
| ------ | ----------- |
| 麵包屑 | bread crumb |
| 列表   | list        |

[location]: https://developer.mozilla.org/en-US/docs/Web/API/Location
