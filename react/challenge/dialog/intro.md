# 如何製作對話視窗 dialog【 dialog | 我不會寫 React Component 】

hashtags: `#react`, `#components`, `#accessibility`, `#dialog`

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
});
```

### Solution

這裡用到了 Compound Component Pattern，  
如果不太了解可以到 [如何製作月曆 compound components【 calendar | 我不會寫 React Component 】](./calendar/compound-components.md) 看詳細說明。

```tsx
type State = {
  labelledby: string;
};
const Context = createContext<State | null>(null);
function useDialogContext(message?: string) {
  const context = useContext(Context);
  if (!context) {
    throw new Error(message);
  }
  return context;
}
```

```tsx
function Title<E extends ElementType>(props: PCP<E, {}>) {
  const context = useDialogContext(
    `<Dialog.Title> cannot be rendered outside <Dialog />`
  );
  const Comp = props.as ?? "h2";
  return <Comp id={context.labelledby} {...props} />;
}

type DialogProps = ComponentProps<"div">;
export function Dialog(props: DialogProps) {
  const id = useId();
  const context = {
    labelledby: id + "labelledby",
    describedby: id + "describedby",
  };

  return (
    <Context.Provider value={context}>
      <div
        {...props}
        aria-modal="true"
        role="dialog"
        aria-labelledby={props["aria-label"] ? undefined : context.labelledby}
      />
    </Context.Provider>
  );
}
```

## Spec: Description

如果對話視窗的內容能夠簡單概括的話，  
可以用 `aria-describedby` 放便用戶了解內容。

```tsx
it(
  "optionally, the aria-describedby property is set on the element with the dialog role " +
    "to indicate which element or elements in the dialog contain content " +
    "that describes the primary purpose or message of the dialog.",
  () => {
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
  }
);
```

### Solution

```tsx
function Description<E extends ElementType>(props: PCP<E, {}>) {
  const context = useDialogContext(
    `<Dialog.Description> cannot be rendered outside <Dialog />`
  );
  const Comp = props.as ?? "div";
  return <Comp id={context.describedby} {...props} />;
}
```

```tsx
type DialogProps = ComponentProps<"div">;
export function Dialog(props: DialogProps) {
  const id = useId();
  const context = {
    labelledby: id + "labelledby",
    describedby: id + "describedby",
  };

  return (
    <Context.Provider value={context}>
      <div
        {...props}
        aria-modal="true"
        role="dialog"
        aria-labelledby={props["aria-label"] ? undefined : context.labelledby}
        aria-describedby={context.describedby}
      />
    </Context.Provider>
  );
}
```

## Spec: Visual styling obscures the content outside of it

關於 [aria-modal][aria-modal] 還有一個要求為：**對外部進行視覺模糊效果**。

這邊設計成用戶可以自行客製化 `Backdrop`，  
如果沒有提供則會有預設的 `Backdrop`。

### Solution

這邊提供了預設，但用戶也可以根據自己需要客製化。

```tsx
type BackdropProps = ComponentProps<"div">;
function Backdrop(props: BackdropProps) {
  if (props.children) {
    return <div {...props}>{props.children}</div>;
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backdropFilter: "brightness(30%)",
      }}
      {...props}
    />
  );
}
```

利用之前的 `slot pattern` 擷取出 `Backdrop`。

```tsx
let backdrop: ReactNode | undefined = undefined;
Children.forEach(children, (element) => {
  if (!isValidElement(element)) return;

  if (element.type === Backdrop) {
    backdrop = element;
  }
});

// ...

return (
  <Context.Provider value={context}>
    {backdrop ?? <Backdrop onClick={onDismiss} />}
    <div
      {...props}
      aria-modal="true"
      role="dialog"
      aria-labelledby={props["aria-label"] ? undefined : context.labelledby}
      aria-describedby={context.describedby}
    >
      {Children.map(children, (element) => {
        if (isValidElement(element) && element.type === Backdrop) {
          return;
        }

        return element;
      })}
    </div>
  </Context.Provider>
);

// ...

Dialog.Title = Title;
Dialog.Description = Description;
Dialog.Backdrop = Backdrop;
```

使用方式像下面這樣。

```tsx
function AddDeliveryAddress(props: ModalProps) {
  return (
    <Dialog
      className={[
        "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
        "bg-white shadow p-8",
      ].join(" ")}
    >
      <Dialog.Backdrop>
        <div className="fixed bg-red-200 inset-0" />
      </Dialog.Backdrop>

      <Dialog.Title className="text-blue-800 text-2xl text-center mb-4">
        Add Delivery Address
      </Dialog.Title>

// ...
```

## Next Section

為了接下來的規格，  
我們需要暫緩元件的部分，先實作一個極為麻煩的程式邏輯，tabbable。

## 名詞對照

| 中文     | 英文         |
| -------- | ------------ |
| 對話視窗 | dialog       |
| 表序列   | tab sequence |

[dialog]: https://www.w3.org/WAI/ARIA/apg/patterns/dialogmodal/
[alertdialog]: https://www.w3.org/WAI/ARIA/apg/patterns/alertdialog/
[heading]: https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/heading_role
