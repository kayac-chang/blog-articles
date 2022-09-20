# 如何製作日期選擇 Date Picker 5【 我不會寫 React Component 】

hashtags: `#react`, `#components`, `#accessibility`, `#datepicker`

本篇接續前篇 [如何製作日期選擇 Date Picker 4【 我不會寫 React Component 】](./datepicker-4.md)  
可以先看完上一篇在接續此篇。

## Spec: Select Date

用戶選擇日期後，當對話視窗關閉時，焦點需要返回打開對話視窗的按鈕。  
當用戶選擇日期後，輸入欄位的數值要對應選擇的日期。  
當用戶選擇日期後，打開對話視窗按鈕的可達性名稱也需要對應選擇的日期。

```tsx
describe("space, enter", () => {
  it('select the date, close the dialog, and move focus to the "choose date" button', async () => {
    setup();
    await user.click(screen.getByRole("button"));
    await user.click(screen.getByText("15"));
    await user.keyboard("{Escape}");
    expect(screen.getByRole("button")).toHaveFocus();
  });

  it('update the value of the "date" input with the selected date', async () => {
    setup(new Date(0));
    await user.click(screen.getByRole("button"));
    await user.click(screen.getByText("01"));
    expect(screen.getByRole("textbox")).toHaveValue("01/01/1970");
    await user.click(screen.getByText("02"));
    expect(screen.getByRole("textbox")).toHaveValue("01/02/1970");
  });

  it('update the accessible name of the "choose date" button to include the selected date', async () => {
    setup(new Date(0));
    await user.click(screen.getByRole("button"));
    await user.click(screen.getByText("01"));
    expect(
      screen.queryByRole("button", { name: "change date, 01/01/1970" })
    ).toBeInTheDocument();
    await user.click(screen.getByText("02"));
    expect(
      screen.queryByRole("button", { name: "change date, 01/02/1970" })
    ).toBeInTheDocument();
  });
});
```

### Solution

這邊我們補上 `input` 的數值控制，  
在 `DatePicker.Field` 元件提供 `format` 函式讓用戶決定數值如何進行 format。

這邊預設的 `value` 跟 `onChange`，用戶可以透過 `props` 將其 override。

```tsx
type FieldProps = ComponentProps<"input"> & {
  format: (value: Date) => string;
};
function Field(_props: FieldProps) {
  const [state] = useDatePickerContext(
    `<DatePicker.Field /> cannot be rendered outside <DatePicker />`
  );
  const { format, ...props } = _props;
  return (
    <input
      value={state.value ? format?.(state.value) : ""}
      onChange={() => {}}
      type="text"
      aria-describedby={state.input_describe}
      {...props}
    />
  );
}
```

```tsx
function TestDatePicker(props: { value?: Date }) {
  const previousFocus = useRef<HTMLButtonElement>(null);
  return (
    <DatePicker value={props.value}>
      <DatePicker.Field format={(value) => format(value, "MM/dd/yyyy")} />
      <DatePicker.Button
        action={{ type: "trigger calendar" }}
        ref={previousFocus}
      >
        {({ value }) =>
          value ? `change date, ${format(value, "MM/dd/yyyy")}` : "choose date"
        }
      </DatePicker.Button>

      <DatePicker.Description>(date format: mm/dd/yyyy)</DatePicker.Description>

      {([{ open, value }, dispatch]) =>
        open && (
          <TestCalendar
            value={value}
            previousFocusRef={previousFocus}
            onDismiss={() => dispatch({ type: "close calendar" })}
          />
        )
      }
    </DatePicker>
  );
}
```

## Spec: Arrow Control

像是之前 [如何製作月曆 integration【 calendar | 我不會寫 React Component 】](./calendar/integration.md)，  
但是這次要增加焦點控制方面的邏輯。

當按 <kbd>Arrow Up</kbd> 的時候，焦點要往上一格。
當按 <kbd>Arrow Down</kbd> 的時候，焦點要往下一格。
當按 <kbd>Arrow Left</kbd> 的時候，焦點要往左一格。
當按 <kbd>Arrow Right</kbd> 的時候，焦點要往右一格。
當按 <kbd>Home</kbd> 的時候，焦點要移動到該週第一天。
當按 <kbd>End</kbd> 的時候，焦點要移動到該週最後一天。

```tsx
describe("up arrow", () => {
  it("moves focus to the same day of the previous week", async () => {
    setup(new Date(0));
    await user.click(screen.getByRole("button"));
    expect(screen.queryByText("01")).toHaveFocus();
    await user.keyboard("{ArrowUp}");
    expect(screen.queryByText("25")).toHaveFocus();
  });
});
describe("down arrow", () => {
  it("moves focus to the same day of the next week", async () => {
    setup(new Date(0));
    await user.click(screen.getByRole("button"));
    expect(screen.queryByText("01")).toHaveFocus();
    await user.keyboard("{ArrowDown}");
    expect(screen.queryByText("08")).toHaveFocus();
  });
});
describe("right arrow", () => {
  it("moves focus to the next day", async () => {
    setup(new Date(0));
    await user.click(screen.getByRole("button"));
    expect(screen.queryByText("01")).toHaveFocus();
    await user.keyboard("{ArrowRight}");
    expect(screen.queryByText("02")).toHaveFocus();
  });
});
describe("left arrow", () => {
  it("moves focus to the previous day", async () => {
    setup(new Date(0));
    await user.click(screen.getByRole("button"));
    expect(screen.queryByText("01")).toHaveFocus();
    await user.keyboard("{ArrowRight}");
    expect(screen.queryByText("02")).toHaveFocus();
  });
});
describe("home", () => {
  it("moves focus to the first day (e.g sunday) of the current week", async () => {
    setup(new Date(0));
    await user.click(screen.getByRole("button"));
    expect(screen.queryByText("01")).toHaveFocus();
    await user.keyboard("{Home}");
    expect(screen.queryByText("28")).toHaveFocus();
  });
});
describe("end", () => {
  it("moves focus to the last day (e.g. saturday) of the current week", async () => {
    setup(new Date(0));
    await user.click(screen.getByRole("button"));
    expect(screen.queryByText("01")).toHaveFocus();
    await user.keyboard("{End}");
    expect(screen.queryByText("03")).toHaveFocus();
  });
});
```

### Solution

這邊的思考邏輯是，  
假設當前焦點在這個 `HTMLTableElement` 底下時，我就需要控制這個元件的焦點。
所以我們要先拿到 `HTMLTableElement` 的 `ref`，  
並掛到 `context` 底下，讓整個 compound components 都能使用這個 `ref`。

```tsx
interface State {
  focus: Date;
  table: (Date | undefined)[][];
  ref: RefObject<HTMLTableElement> | null;
}
```

這次用到一個 react pattern，**merging ref**。  
它其實沒有正式被列入文件，但是在很多第三方套件程式碼都能見到這個技術。

```tsx
function assignRef<T>(ref: ForwardedRef<T>, value: T | null): ForwardedRef<T> {
  if (typeof ref === "function") {
    ref(value);
  } else if (ref) {
    ref.current = value;
  }
  return ref;
}
```

透過 `callbackRef` 將同一個元素的 reference 綁到多個 `ref` 物件上。

```tsx
const Grid = forwardRef<HTMLTableElement, GridProps>((props, ref) => {
  //...

  const innerRef = useRef<HTMLTableElement | null>(null);

  return (
    <Context.Provider value={{ focus, table, ref: innerRef }}>
      <table
        {...rest}
        role="grid"
        ref={(element) => {
          assignRef(innerRef, element);
          assignRef(ref, element);
        }}
        aria-labelledby={context?.grid_label}
      >
        <thead role="rowgroup">
          <tr role="row">{columnheader}</tr>
        </thead>
        <tbody>{gridcell}</tbody>
      </table>
    </Context.Provider>
  );
});
```

這裡也透過 `callbackRef` 來綁定外部的 `ref` 物件。

透過 `context.ref` 是否包含 `document.activeElement` 確認渲染當下，  
用戶的焦點是否在 `grid` 上，  
如果有的話我們就要在新的元素渲染上去時，順帶進行對焦。

> 這邊不應該等到 `useEffect` 才進行 `focus`，  
> 原因是當新的元件渲染上畫面，原本正在對焦的元素被替換了，  
> 當焦點遺失正在對焦的元素會對焦回 `document`，  
> 這也是 React 在處理焦點遺失時一個很難被抓出跟解決的問題。

```tsx
const GridCell = forwardRef<HTMLElement, GridCellProps>((_props, _ref) => {
  const context = useMonthCalendarContext(
    `<GridCell /> cannot be rendered outside <MonthCalendar />`
  );
  const { children, ...props } = _props;

  const isFocusWithinTable = context.ref?.current?.contains(
    document.activeElement
  );

  return (
    <>
      {context.table.map((row, index) => (
        <tr key={index}>
          {row.map((day, index) => {
            if (!day) {
              return <td key={index} {...props} tabIndex={-1} />;
            }

            const element = children?.(day);
            const tabIndex = isSameDay(day, context.focus) ? 0 : -1;
            const ref = isSameDay(day, context.focus)
              ? (element: HTMLElement | null) => {
                  assignRef(_ref, element);
                  isFocusWithinTable && element?.focus();
                }
              : undefined;

            if (isValidElement(element)) {
              return (
                <td key={index} {...props}>
                  {cloneElement(element, {
                    ...element.props,
                    tabIndex,
                    ref,
                  })}
                </td>
              );
            }

            return (
              <td key={index} {...props} tabIndex={tabIndex} ref={ref}>
                {format(day, "dd")}
              </td>
            );
          })}
        </tr>
      ))}
    </>
  );
});
```

## Spec: Page Control

同樣可參考回 [如何製作月曆 integration【 calendar | 我不會寫 React Component 】](./calendar/integration.md)。

當按 <kbd>PageUp</kbd> 的時候，日曆要切換至前一個月份。
當按 <kbd>Shift + PageUp</kbd> 的時候，日曆要切換至前一年。
當按 <kbd>PageDown</kbd> 的時候，日曆要切換至下一個月份。
當按 <kbd>Shift + PageDown</kbd> 的時候，日曆要切換至下一年。

```tsx
describe("page up", () => {
  it("changes the grid of dates to the previous month", async () => {
    setup(new Date(0));
    await user.click(screen.getByRole("button"));
    await user.keyboard("{PageUp}");
    expect(screen.getByRole("grid")).toHaveAccessibleName("December 1969");
  });
  it(
    "sets focus on the same day of the same week. " +
      "if that day does not exist, then moves focus to the same day of the previous or next week",
    async () => {
      setup(new Date(0));
      await user.click(screen.getByRole("button"));
      expect(screen.queryByText("01")).toHaveFocus();
      await user.keyboard("{PageUp}");
      expect(screen.queryByText("01")).toHaveFocus();
    }
  );
});
describe("shift + page up", () => {
  it("changes the grid of dates to the previous year", async () => {
    setup(new Date(0));
    await user.click(screen.getByRole("button"));
    await user.keyboard("{Shift>}{PageUp}{/Shift}");
    expect(screen.getByRole("grid")).toHaveAccessibleName("January 1969");
  });
  it(
    "sets focus on the same day of the same week. " +
      "if that day does not exist, then moves focus to the same day of the previous or next week",
    async () => {
      setup(new Date(0));
      await user.click(screen.getByRole("button"));
      expect(screen.queryByText("01")).toHaveFocus();
      await user.keyboard("{Shift>}{PageUp}{/Shift}");
      expect(screen.queryByText("01")).toHaveFocus();
    }
  );
});
describe("page down", () => {
  it("changes the grid of dates to the next month", async () => {
    setup(new Date(0));
    await user.click(screen.getByRole("button"));
    await user.keyboard("{PageDown}");
    expect(screen.getByRole("grid")).toHaveAccessibleName("February 1970");
  });
  it(
    "sets focus on the same day of the same week. " +
      "if that day does not exist, then moves focus to the same day of the previous or next week.",
    async () => {
      setup(new Date(0));
      await user.click(screen.getByRole("button"));
      expect(screen.queryByText("01")).toHaveFocus();
      await user.keyboard("{PageDown}");
      expect(screen.queryByText("01")).toHaveFocus();
    }
  );
});
describe("shift + page down", () => {
  it("changes the grid of dates to the next year", async () => {
    setup(new Date(0));
    await user.click(screen.getByRole("button"));
    await user.keyboard("{Shift>}{PageDown}{/Shift}");
    expect(screen.getByRole("grid")).toHaveAccessibleName("January 1971");
  });
  it(
    "sets focus on the same day of the same week. " +
      "if that day does not exist, then moves focus to the same day of the previous or next week",
    async () => {
      setup(new Date(0));
      await user.click(screen.getByRole("button"));
      expect(screen.queryByText("01")).toHaveFocus();
      await user.keyboard("{Shift>}{PageDown}{/Shift}");
      expect(screen.queryByText("01")).toHaveFocus();
    }
  );
});
```

## Conclusion

我們總花了 5 篇才結束了日期選擇元件，  
一個看似小小的元件，  
要實作到完整的規格是要花費很多時間的。

## 名詞對照

| 中文     | 英文        |
| -------- | ----------- |
| 日期選擇 | date picker |
| 對話視窗 | dialog      |
