# 如何製作對話視窗 multi-step【 dialog | 我不會寫 React Component 】

hashtags: `#react`, `#dialog`

本篇接續前篇 [如何製作對話視窗 interaction【 dialog | 我不會寫 React Component 】](./dialog/interaction.md)  
可以先看完上一篇在接續此篇。

## 情境

接下來，我復刻了一下 WAI 提供的 [Example][dialog] 來繼續進行接下來的開發。
這個範例特別的地方在於，他需要實作多步驟對話視窗。

這邊先簡單實作了一個 stack 用於 對話窗堆疊 效果。

```tsx
import { Dialog } from "dialog";
import { useRef, useState } from "react";

type DialogID = "add-delivery-address" | "verification-result";

export default function Web() {
  const [stack, setStack] = useState<DialogID[]>([]);

  const push = (newStack: DialogID) => () => setStack(stack.concat(newStack));
  const pop = () => setStack(stack.slice(0, -1));

  return (
    <div className="h-screen w-screen grid place-content-center bg-gray-200">
      <button type="button" onClick={push("add-delivery-address")}>
        Add Delivery Address
      </button>

      {stack.includes("add-delivery-address") && (
        <AddDeliveryAddress pop={pop} push={push} />
      )}

      {stack.includes("verification-result") && (
        <VerificationResult pop={pop} />
      )}
    </div>
  );
}
```

```tsx
type ModalProps = {
  pop?: () => void;
  push?: (stack: DialogID) => () => void;
};
function AddDeliveryAddress(props: ModalProps) {
  return (
    <Dialog
      onDismiss={props.pop}
      className={[
        "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
        "bg-white shadow p-8",
      ].join(" ")}
    >
      <Dialog.Title className="text-blue-800 text-2xl text-center mb-4">
        Add Delivery Address
      </Dialog.Title>

      <form>
        <div>
          <label>
            <strong>Street:</strong>
            <input type="text" className="border border-black w-full" />
          </label>
        </div>

        <div>
          <label>
            <strong>City:</strong>
            <input type="text" className="border border-black w-full" />
          </label>
        </div>

        <div>
          <label>
            <strong>State:</strong>
            <input type="text" className="border border-black w-full" />
          </label>
        </div>

        <div>
          <label>
            <strong>Zip:</strong>
            <input type="text" className="border border-black w-full" />
          </label>
        </div>

        <div>
          <label htmlFor="special_instructions">
            <strong>Special instructions:</strong>
          </label>
          <input
            id="special_instructions"
            type="text"
            aria-describedby="special_instructions_desc"
            className="border border-black w-full"
          />
          <div>
            For example, gate code or other information to help the driver find
            you
          </div>
        </div>
      </form>

      <div className="mt-4 gap-2 flex justify-end">
        <button
          type="button"
          className="bg-blue-900 text-white px-3 py-1"
          onClick={props.push?.("verification-result")}
        >
          Verify Address
        </button>
        <button type="button" className="bg-green-600 text-white px-3 py-1">
          Add
        </button>
        <button
          type="button"
          className="bg-red-600 text-white px-3 py-1"
          onClick={props.pop}
        >
          Cancel
        </button>
      </div>
    </Dialog>
  );
}
```

```tsx
function VerificationResult(props: ModalProps) {
  const ref = useRef(null);
  return (
    <Dialog
      initialFocusRef={ref}
      className={[
        "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
        "bg-white shadow p-8",
        "max-h-[60vh] overflow-auto",
      ].join(" ")}
      onDismiss={props.pop}
    >
      <Dialog.Title className="text-blue-800 text-2xl text-center mb-4">
        Verification Result
      </Dialog.Title>
      <div className="text-lg">
        <p tabIndex={-1} ref={ref}>
          This is just a demonstration. If it were a real application, it would
          provide a message telling whether the entered address is valid.
        </p>
        <p>
          For demonstration purposes, this dialog has a lot of text. It
          demonstrates a scenario where:
        </p>
        <ul>
          <li>
            The first interactive element, the help link, is at the bottom of
            the dialog.
          </li>
          <li>
            If focus is placed on the first interactive element when the dialog
            opens, the validation message may not be visible.
          </li>
          <li>
            If the validation message is visible and the focus is on the help
            link, then the focus may not be visible.
          </li>
          <li>
            When the dialog opens, it is important that both:
            <ul>
              <li>
                The beginning of the text is visible so users do not have to
                scroll back to start reading.
              </li>
              <li>The keyboard focus always remains visible.</li>
            </ul>
          </li>
        </ul>
        <p>There are several ways to resolve this issue:</p>
        <ul>
          <li>
            Place an interactive element at the top of the dialog, e.g., a
            button or link.
          </li>
          <li>
            Make a static element focusable, e.g., the dialog title or the first
            block of text.
          </li>
        </ul>
        <p>
          Please <em>DO NOT </em> make the element with role dialog focusable!
        </p>
        <ul>
          <li>
            The larger a focusable element is, the more difficult it is to
            visually identify the location of focus, especially for users with a
            narrow field of view.
          </li>
          <li>
            The dialog has a visual border, so creating a clear visual indicator
            of focus when the entire dialog has focus is not very feasible.
          </li>
          <li>
            Screen readers read the label and content of focusable elements. The
            dialog contains its label and a lot of content! If a dialog like
            this one has focus, the actual focus is difficult to comprehend.
          </li>
        </ul>
        <p>
          In this dialog, the first paragraph has{" "}
          <code>
            tabindex=<q>-1</q>
          </code>
          . The first paragraph is also contained inside the element that provides
          the dialog description, i.e., the element that is referenced by <code>
            aria-describedby
          </code>. With some screen readers, this may have one negative but relatively
          insignificant side effect when the dialog opens -- the first paragraph
          may be announced twice. Nonetheless, making the first paragraph focusable
          and setting the initial focus on it is the most broadly accessible option.
        </p>
      </div>
      <div className="mt-4 gap-2 flex justify-end">
        <a href="#" className="text-blue-700 px-3 py-1">
          link to help
        </a>
        <button type="button" className="bg-green-600 text-white px-3 py-1">
          accepting an alternative form
        </button>
        <button
          type="button"
          className="bg-red-600 text-white px-3 py-1"
          onClick={props.pop}
        >
          Close
        </button>
      </div>
    </Dialog>
  );
}
```

## Spec: 轉移對焦

當[對話視窗][dialog]關閉時，焦點會轉移回 調出對話視窗的元素 上。

### Solution

這邊透過 `useRef` 記憶了當前的焦點 index，  
當對話視窗重新渲染時， 焦點就會對回 `lastFocus` 上。

```tsx
const lastFocus = useRef(0);
const ref = useRef<HTMLDivElement>(null);
useEffect(() => {
  const element = ref.current;
  if (!element) return;

  const tabbables = tabbable(element, {
    displayCheck: IS_TEST_ENV,
  }) as HTMLElement[];

  focus(initialFocusRef?.current ?? tabbables.at(lastFocus.current));

  function onKeyDown(event: KeyboardEvent) {
    if (!(document.activeElement instanceof HTMLElement)) return;
    if (!element?.contains(document.activeElement)) return;

    const index = tabbables.indexOf(document.activeElement);
    const { key, shiftKey } = event;

    if (shiftKey && key === "Tab") {
      event.preventDefault();

      const nextFocusIndex = (index - 1) % tabbables.length;
      lastFocus.current = nextFocusIndex;
      return focus(tabbables.at(nextFocusIndex));
    }
    if (key === "Tab") {
      event.preventDefault();

      const nextFocusIndex = (index + 1) % tabbables.length;
      lastFocus.current = nextFocusIndex;
      return focus(tabbables.at(nextFocusIndex));
    }
    if (key === "Escape") {
      event.preventDefault();
      return onDismiss?.();
    }
  }

  window.addEventListener("keydown", onKeyDown);
  return () => void window.removeEventListener("keydown", onKeyDown);
}, [ref.current, initialFocusRef?.current, lastFocus.current, onDismiss]);
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
    const onClick = () => {
      element.props.onClick?.();
      onDismiss?.();
    };
    backdrop = cloneElement(element, { ...element.props, onClick });
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
      ref={ref}
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

使用方式如下。

```tsx
function AddDeliveryAddress(props: ModalProps) {
  return (
    <Dialog
      onDismiss={props.pop}
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

[dialog]: https://www.w3.org/WAI/ARIA/apg/example-index/dialog-modal/dialog.html
[aria-modal]: https://w3c.github.io/aria/#aria-modal
