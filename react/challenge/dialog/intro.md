# 如何製作對話視窗 dialog【 dialog | 我不會寫 React Component 】

hashtags: `#react`, `#dialog`

## About

[對話視窗][dialog] 是一種視窗，會覆蓋在主視窗或是其他對話視窗之上。  
在其之下的視窗會暫時停止運作。
用戶只能對當前正在運作的對話視窗進行操作。

在激活的對話視窗之外的內容通常會壓黑或是模糊使其難以辨識，
部分實作中，試圖操作外部內容會使對話視窗關閉。

對話視窗會有自己的表序列，
就是 <kbd>Tab</kdb> 跟 <kdb>Shift + Tab</kdb> 不能移動焦點到視窗之外。

另外還有一種類似的元件但並不相同的元件 [彈窗][alertdialog] 不算在此類。

## Spec: Dialog

元件必須要標有 `role="dialog"`。

```tsx
it("the element that serves as the dialog container has a role of dialog.", () => {
  render(<Dialog data-testid="a" />);
  expect(screen.getByTestId("a")).toHaveAttribute("role", "dialog");
});

it("all elements required to operate the dialog are descendants of the element that has role dialog.", () => {
  render(
    <Dialog data-testid="a">
      <Dialog data-testid="b" />
    </Dialog>
  );
  expect(screen.getByTestId("a")).toHaveAttribute("role", "dialog");
  expect(screen.getByTestId("b")).toHaveAttribute("role", "dialog");
});
```

### Solution

```tsx
import type { ComponentProps } from "react";

type DialogProps = ComponentProps<"div">;
export function Dialog(props: DialogProps) {
  return <div {...props} role="dialog" />;
}
```

## Spec: Modal

標註元件 `aria-modal` 將會鎖定輔助科技的用戶只能在元件內移動，  
因此要格外注意，以下實作才可以標註 `aria-modal`：

- 以實作程式碼避免用戶跟 modal 外部元件進行交互。
- 對外部進行視覺模糊效果

`aria-modal` 是用來取代在 ARIA 1.1 之前的作法，  
早期是透過將外部不可交互的元件全部標註 `aria-hidden`。

```tsx
it("the dialog container element has aria-modal set to true.", () => {
  render(<Dialog data-testid="a" />);
  expect(screen.getByTestId("a")).toHaveAttribute("aria-modal", "true");
});
```

### Solution

```tsx
import type { ComponentProps } from "react";

type DialogProps = ComponentProps<"div">;
export function Dialog(props: DialogProps) {
  return <div {...props} aria-modal="true" role="dialog" />;
}
```

## Spec: Label

`dialog` 必須標註 `label` 作為標題。  
有兩種情境的標注方式：

- 標題需要顯示在畫面上，用 `aria-labelledby` 對應帶有 [heading] 規則的元件，像是 `h1` ~ `h2`。
- 標題無需顯示在畫面上，用 `aria-label` 註記標題即可。

```tsx
describe("the dialog has either:", () => {
  it("a value set for the aria-labelledby property that refers to a visible dialog title.", () => {
    //
    render(
      <Dialog>
        <Dialog.Title>This is Title</Dialog.Title>
      </Dialog>
    );
    expect(screen.getByRole("dialog")).toHaveAttribute(
      "aria-labelledby",
      screen.getByText("This is Title").id
    );

    expect(screen.getByRole("dialog")).not.toHaveAttribute("aria-label");
  });

  it("a label specified by aria-label.", () => {
    render(<Dialog aria-label="This is Title" />);

    expect(screen.getByRole("dialog")).toHaveAttribute(
      "aria-label",
      "This is Title"
    );
    expect(screen.getByRole("dialog")).not.toHaveAttribute("aria-labelledby");
  });

  it("dialog should has either", () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(() => render(<Dialog />)).toThrow(
      "dialog should has either: \n" +
        "- a value set for the aria-labelledby property that refers to a visible dialog title.\n" +
        "- a label specified by aria-label."
    );
    vi.clearAllMocks();
  });
});
```

假如 `dialog` 沒有標示 `label` 要拋錯，所以前面的測試要改。

```tsx
it("the element that serves as the dialog container has a role of dialog.", () => {
  render(<Dialog data-testid="a" aria-label="a" />);
  expect(screen.getByTestId("a")).toHaveAttribute("role", "dialog");
});

it("all elements required to operate the dialog are descendants of the element that has role dialog.", () => {
  render(
    <Dialog data-testid="a" aria-label="a">
      <Dialog data-testid="b" aria-label="b" />
    </Dialog>
  );
  expect(screen.getByTestId("a")).toHaveAttribute("role", "dialog");
  expect(screen.getByTestId("b")).toHaveAttribute("role", "dialog");
});

it("the dialog container element has aria-modal set to true.", () => {
  render(<Dialog data-testid="a" aria-label="a" />);
  expect(screen.getByTestId("a")).toHaveAttribute("aria-modal", "true");
});
```

### Solution

這邊先行檢查了 `children` 底下是否有 `Title`，沒有就去檢查 `aria-label`，  
兩者都沒有則拋出錯誤，用來提示用戶要記得標注標題。

```tsx
type TitleProps = ComponentProps<"h2">;
function Title(props: TitleProps) {
  return <h2 {...props} />;
}

type DialogProps = ComponentProps<"div">;
export function Dialog(props: DialogProps) {
  const id = useId();

  let labelledby = undefined;
  Children.forEach(props.children, (element) => {
    if (isValidElement(element) && element.type === Title) {
      labelledby = id;
    }
  });

  if (!labelledby && !props["aria-label"]) {
    throw new Error(
      "dialog should has either: \n" +
        "- a value set for the aria-labelledby property that refers to a visible dialog title.\n" +
        "- a label specified by aria-label."
    );
  }

  return (
    <div
      {...props}
      aria-modal="true"
      role="dialog"
      aria-labelledby={labelledby}
    >
      {Children.map(props.children, (element) => {
        if (isValidElement(element) && element.type === Title) {
          return cloneElement(element, { ...element.props, id });
        }

        return element;
      })}
    </div>
  );
}
```

## Spec: Description

```tsx
it("optionally, the aria-describedby property is set on the element with the dialog role \
      to indicate which element or elements in the dialog contain content \
      that describes the primary purpose or message of the dialog.", () => {
  render(
    <Dialog aria-label="title">
      <Dialog.Description data-testid="desc">
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Dolorum at
        obcaecati, aliquid modi deserunt reprehenderit maiores nulla soluta
        itaque veritatis perspiciatis praesentium repellendus animi beatae
        expedita temporibus. Eaque, quae facilis?
      </Dialog.Description>
    </Dialog>
  );

  expect(screen.getByRole("dialog")).toHaveAttribute(
    "aria-describedby",
    screen.getByTestId("desc").id
  );
});
```

### Solution

```tsx
type DescriptionProps = ComponentProps<"div">;
function Description(props: DescriptionProps) {
  return <div {...props} />;
}

type TitleProps = ComponentProps<"h2">;
function Title(props: TitleProps) {
  return <h2 {...props} />;
}

type DialogProps = ComponentProps<"div">;
export function Dialog(props: DialogProps) {
  const id = useId();

  let labelledby: string | undefined = undefined;
  let describedby: string | undefined = undefined;
  Children.forEach(props.children, (element) => {
    if (!isValidElement(element)) return;

    if (element.type === Title) {
      labelledby = id + "label";
    }
    if (element.type === Description) {
      describedby = id + "description";
    }
  });

  if (!labelledby && !props["aria-label"]) {
    throw new Error(
      "dialog should has either: \n" +
        "- a value set for the aria-labelledby property that refers to a visible dialog title.\n" +
        "- a label specified by aria-label."
    );
  }

  return (
    <div
      {...props}
      aria-modal="true"
      role="dialog"
      aria-labelledby={labelledby}
      aria-describedby={describedby}
    >
      {Children.map(props.children, (element) => {
        if (isValidElement(element)) {
          let id = undefined;

          if (element.type === Title) {
            id = labelledby;
          }
          if (element.type === Description) {
            id = describedby;
          }

          return cloneElement(element, { ...element.props, id });
        }

        return element;
      })}
    </div>
  );
}
```

## Next Section

先讓我們停在這裡，  
因為下面要介紹 tabbable。

## 名詞對照

| 中文     | 英文         |
| -------- | ------------ |
| 對話視窗 | dialog       |
| 表序列   | tab sequence |

[dialog]: https://www.w3.org/WAI/ARIA/apg/patterns/dialogmodal/
[alertdialog]: https://www.w3.org/WAI/ARIA/apg/patterns/alertdialog/
[heading]: https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/heading_role
