# 如何製作對話視窗 interaction【 dialog | 我不會寫 React Component 】

hashtags: `#react`, `#components`, `#accessibility`, `#dialog`

本篇接續前篇 [如何製作對話視窗 tabbable【 dialog | 我不會寫 React Component 】](./tabbable.md)  
可以先看完上一篇再接續此篇。

## Spec: Init Focus

當[對話視窗][dialog]打開時，焦點會轉移到[對話視窗][dialog]內部的元素上。  
一般來說，焦點會對焦在第一個可聚焦的元素，  
然而，最適合的對焦位置取決於一些實作細節，例如說：

- 當視窗的內容包含一些結構，像是 `lists`，`tables`，或是多個 `paragraphs`，  
  這些需要保持閱讀順序會比較容易理解內文。  
  建議將第一個靜態元素設定成 `tabindex="-1"` 並將焦點對焦在它身上。
  這會讓使用輔助科技的用戶可以順著內文想呈現的閱讀順序接收資訊。

- 如果內文太長，導致對焦在第一個可交互元素時，會使畫面滑動到下方，  
  建議將對話視窗最上方的靜態元素設定成 `tabindex="-1"`，就是 `title` 或是 第一個 `paragraph`，並對焦在它身上。

- 如果對話視窗要執行的步驟是不可逆的，像是 刪除資料 或是 確認訂單交易，  
  建議將焦點對焦在最不會造成影響的交互動作，像是 取消。

- 如果對話視窗被用於引導交互動作，像是提供額外資訊或是繼續步驟，  
  建議將焦點對焦在最常被使用的元素上，像是 OK 或是 下一步。

以上規格，基本上要根據應用程式的需求下去調整，  
因為這邊開發的是共用元件，所以不特別處理上述規格，  
留給應用方下去客製化。

```tsx
const setup = () => {
  user.setup();
  render(
    <Dialog aria-label="title">
      <input data-testid="element" type="checkbox" />
      <input data-testid="element" type="radio" />
      <input data-testid="element" type="number" />
    </Dialog>
  );
};

describe("dialog open", () => {
  it("when a dialog opens, focus moves to an element contained in the dialog", () => {
    setup();
    const [checkbox] = screen.getAllByTestId("element");
    expect(checkbox).toHaveFocus();
  });
});
```

### Solution

這邊用到我們在上一篇實作的 [tabbable](./tabbable.md)，  
注意到， `displayCheck` 在單元測試的時候要設定成 `false`，  
因為沒有瀏覽器幫我們實際渲染。

這邊提供了 `initialFocusRef`，讓用戶可以決定初始的聚焦對象，  
如果沒有提供則預設聚焦於第一個可聚焦元素。

```tsx
function focus(node?: HTMLElement | null) {
  return node?.focus();
}

const IS_TEST_ENV = process.env.NODE_ENV !== "test";

type DialogProps = ComponentProps<"div"> & {
  initialFocusRef?: RefObject<HTMLElement>;
};
export function Dialog(_props: DialogProps) {
  const { children, initialFocusRef, ...props } = _props;

  let backdrop: ReactNode | undefined = undefined;
  Children.forEach(children, (element) => {
    if (!isValidElement(element)) return;

    if (element.type === Backdrop) {
      backdrop = element;
    }
  });

  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const tabbables = tabbable(element, {
      displayCheck: IS_TEST_ENV,
    }) as HTMLElement[];

    focus(initialFocusRef?.current ?? tabbables.at(0));
  }, [ref.current, initialFocusRef?.current]);

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
}
```

## Spec: Tab

按下 <kbd>Tab</kbd> 要對焦到下一個可聚焦元素，  
並且當聚焦在最後一個可聚焦元素時，按下 <kbd>Tab</kbd> 應該要回到第一個可聚焦元素 (循環)。

```tsx
describe("tab", () => {
  it("moves focus to the next tabbable element inside the dialog.", async () => {
    setup();
    const [checkbox, radio, number] = screen.getAllByTestId("element");
    expect(checkbox).toHaveFocus();
    await user.keyboard("{Tab}");
    expect(radio).toHaveFocus();
    await user.keyboard("{Tab}");
    expect(number).toHaveFocus();
    await user.keyboard("{Tab}");
    expect(checkbox).toHaveFocus();
  });

  it(
    "if focus is on the last tabbable element inside the dialog, " +
      "moves focus to the first tabbable element inside the dialog.",
    async () => {
      setup();
      const [checkbox, _, number] = screen.getAllByTestId("element");
      number.focus();
      expect(number).toHaveFocus();
      await user.keyboard("{Tab}");
      expect(checkbox).toHaveFocus();
    }
  );
});
```

### Solution

在這邊直接使用瀏覽器當前聚焦的元素回推 index，  
原因是我不能保證焦點不會被外界改變 (例如，用滑鼠改變當前焦點，或是 其他腳本動態改變焦點)。

注意，`event.preventDefault()` 會擋下這個事件的所有瀏覽器預設行為，
我們不用全部都擋掉，只需要阻擋我們需要的按鍵行為即可。

```tsx
useEffect(() => {
  const element = ref.current;
  if (!element) return;

  const tabbables = tabbable(element, {
    displayCheck: IS_TEST_ENV,
  }) as HTMLElement[];

  focus(initialFocusRef?.current ?? tabbables.at(0));

  function onKeyDown(event: KeyboardEvent) {
    if (!(document.activeElement instanceof HTMLElement)) return;

    const index = tabbables.indexOf(document.activeElement);
    const { key, shiftKey } = event;

    if (key === "Tab") {
      event.preventDefault();
      const nextFocusIndex = (index + 1) % tabbables.length;
      return focus(tabbables.at(nextFocusIndex));
    }
  }

  window.addEventListener("keydown", onKeyDown);
  return () => void window.removeEventListener("keydown", onKeyDown);
}, [ref.current, initialFocusRef?.current]);
```

## Spec: Shift + Tab

按下 <kbd>Shift + Tab</kbd> 要對焦到上一個可聚焦元素，  
並且當聚焦在第一個可聚焦元素時，按下 <kbd>Shift + Tab</kbd> 應該要到最後一個可聚焦元素 (循環)。

```tsx
describe("shift + tab", () => {
  it("moves focus to the previous tabbable element inside the dialog.", async () => {
    setup();
    const [checkbox, radio, number] = screen.getAllByTestId("element");
    expect(checkbox).toHaveFocus();
    await user.keyboard("{Shift>}{Tab}{/Shift}");
    expect(number).toHaveFocus();
    await user.keyboard("{Shift>}{Tab}{/Shift}");
    expect(radio).toHaveFocus();
    await user.keyboard("{Shift>}{Tab}{/Shift}");
    expect(checkbox).toHaveFocus();
  });

  it(
    "if focus is on the first tabbable element inside the dialog, " +
      "moves focus to the last tabbable element inside the dialog.",
    async () => {
      setup();
      const [checkbox, _, number] = screen.getAllByTestId("element");
      checkbox.focus();
      expect(checkbox).toHaveFocus();
      await user.keyboard("{Shift>}{Tab}{/Shift}");
      expect(number).toHaveFocus();
    }
  );
});
```

### Solution

這邊使用了 [at][at] 方便處理逆向的 index 取值。

```tsx
useEffect(() => {
  const element = ref.current;
  if (!element) return;

  const tabbables = tabbable(element, {
    displayCheck: IS_TEST_ENV,
  }) as HTMLElement[];

  focus(initialFocusRef?.current ?? tabbables.at(0));

  function onKeyDown(event: KeyboardEvent) {
    if (!(document.activeElement instanceof HTMLElement)) return;

    const index = tabbables.indexOf(document.activeElement);
    const { key, shiftKey } = event;

    if (shiftKey && key === "Tab") {
      event.preventDefault();

      const nextFocusIndex = (index - 1) % tabbables.length;
      return focus(tabbables.at(nextFocusIndex));
    }
    if (key === "Tab") {
      event.preventDefault();

      const nextFocusIndex = (index + 1) % tabbables.length;
      return focus(tabbables.at(nextFocusIndex));
    }
  }

  window.addEventListener("keydown", onKeyDown);
  return () => void window.removeEventListener("keydown", onKeyDown);
}, [ref.current, initialFocusRef?.current]);
```

## Spec: Close

用戶按下 <kbd>Esc</kbd> 時，要關閉對話視窗。  
並且焦點要回到之前對焦的元素。

```tsx
describe("escape", () => {
  const Comp = () => {
    const ref = useRef(null);
    const [open, setOpen] = useState(false);

    return (
      <>
        <button ref={ref} onClick={() => setOpen(true)}>
          Open Dialog
        </button>

        {open && (
          <Dialog
            data-testid="dialog"
            aria-label="title"
            previousFocusRef={ref}
            onDismiss={() => setOpen(false)}
          >
            <input data-testid="element" type="checkbox" />
            <input data-testid="element" type="radio" />
            <input data-testid="element" type="number" />
          </Dialog>
        )}
      </>
    );
  };

  it("closes the dialog.", async () => {
    user.setup();
    render(<Comp />);

    const button = screen.getByRole("button");
    await user.click(button);
    const dialog = screen.getByTestId("dialog");
    expect(dialog).toBeInTheDocument();

    await user.keyboard("{Escape}");
    expect(dialog).not.toBeInTheDocument();
    expect(button).toHaveFocus();
  });
});
```

### Solution

除了按下 <kbd>Esc</kbd> 要關閉對話視窗之外，  
點擊 `Backdrop` 也會需要關閉視窗。

加入 `previousFocusRef`，讓我們在 `onDismiss` 被執行後可以對焦到該元素。

```tsx
type DialogProps = ComponentProps<"div"> & {
  onDismiss?: () => void;
  initialFocusRef?: RefObject<HTMLElement>;
  previousFocusRef?: RefObject<HTMLElement>;
};
export function Dialog(_props: DialogProps) {
  const { children, onDismiss, initialFocusRef, ...props } = _props;

  const onClose = useCallback(() => {
    onDismiss?.();
    focus(previousFocusRef?.current);
  }, [onDismiss, previousFocusRef?.current]);

  let backdrop: ReactNode | undefined = undefined;
  Children.forEach(children, (element) => {
    if (!isValidElement(element)) return;

    if (element.type === Backdrop) {
      const onClick = () => {
        element.props.onClick?.();
        onClose();
      };
      backdrop = cloneElement(element, { ...element.props, onClick });
    }
  });

  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const tabbables = tabbable(element, {
      displayCheck: IS_TEST_ENV,
    }) as HTMLElement[];

    focus(initialFocusRef?.current ?? tabbables.at(0));

    function onKeyDown(event: KeyboardEvent) {
      if (!(document.activeElement instanceof HTMLElement)) return;
      if (!element?.contains(document.activeElement)) return;

      const index = tabbables.indexOf(document.activeElement);
      const { key, shiftKey } = event;

      if (shiftKey && key === "Tab") {
        event.preventDefault();
        const nextFocusIndex = (index - 1) % tabbables.length;
        return focus(tabbables.at(nextFocusIndex));
      }
      if (key === "Tab") {
        event.preventDefault();
        const nextFocusIndex = (index + 1) % tabbables.length;
        return focus(tabbables.at(nextFocusIndex));
      }
      if (key === "Escape") {
        event.preventDefault();
        return onClose?.();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => void window.removeEventListener("keydown", onKeyDown);
  }, [ref.current, initialFocusRef?.current, onClose]);

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
}
```

## 名詞對照

| 中文       | 英文                   |
| ---------- | ---------------------- |
| 元素       | element                |
| 可交互元素 | interactive element    |
| 焦點       | focus                  |
| 可聚焦     | focusable              |
| 輔助科技   | assistive technologies |

[dialog]: https://www.w3.org/WAI/ARIA/apg/patterns/dialogmodal/
[at]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/at
