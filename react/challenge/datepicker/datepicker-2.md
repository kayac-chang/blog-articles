# 如何製作日期選擇 Date Picker 2【 我不會寫 React Component 】

hashtags: `#react`, `#components`, `#accessibility`, `#datepicker`

## Spec: Dialog / Modal

點選選擇日期按鈕時，要開啟對話視窗。

```tsx
it("identifies the element as a dialog", async () => {
  setup();
  await user.click(screen.getByRole("button", { name: /choose date/ }));
  expect(screen.queryByRole("dialog")).toBeInTheDocument();
});

it("identifies the element as a dialog", () => {
  expect(screen.queryByRole("dialog")).toBeInTheDocument();
});
```

### Solution

這部分已經由 [如何製作對話視窗 dialog【 dialog | 我不會寫 React Component 】](./dialog/intro.md) 實作了，  
故這邊跳過。

## Spec: Calendar Control

開啟 對話視窗時，
必須提供快捷鍵控制改變日曆月份跟年份的按鈕。

```tsx
it("when the month and/or year changes the content of the h2 element is updated", async () => {
  const h2 = screen.queryByRole("heading", { level: 2 });
  expect(h2).toHaveTextContent("January 1970");

  await user.click(screen.getByRole("button", { name: "next month" }));
  expect(h2).toHaveTextContent("February 1970");

  await user.click(screen.getByRole("button", { name: "next year" }));
  expect(h2).toHaveTextContent("February 1971");

  await user.click(screen.getByRole("button", { name: "last year" }));
  expect(h2).toHaveTextContent("February 1970");

  await user.click(screen.getByRole("button", { name: "last month" }));
  expect(h2).toHaveTextContent("January 1970");
});
```

### Solution

這部分也由 [如何製作月曆 integration【 calendar | 我不會寫 React Component 】](./calendar/integration.md) 實作了，  
故這邊跳過。

## Spec: live region

日曆用來顯示年月的標頭必須標註 live region，  
讓螢幕報讀用戶在用鍵盤或按鈕控制更改年月時，可以得到反饋。

```tsx
it("indicates the h2 should be automatically announced by screen readers", async () => {
  setup();
  await user.click(screen.getByRole("button"));
  expect(screen.getByRole("heading", { level: 2 }))
    //
    .toHaveAttribute("aria-live");
});
```

### Solution

這部分由 [如何製作月曆 control【 calendar | 我不會寫 React Component 】](./calendar/calendar.md) 實作了，  
故這邊跳過。

> 這邊是否有發現解耦跟組合的好處，  
> 我不用再花時間做已經做過的規格，  
> 透過元件組合的方式，  
> 可以更有效且更穩固的方式進行開發。

## Spec: keyboard help

鍵盤提示必須顯示在對話視窗下方。  
並標註 live region 用於提醒螢幕報讀用戶焦點已經轉移至日曆的方格。

```tsx
it(
  "indicates the element that displays information about keyboard commands " +
    "for navigating the grid should be automatically announced by screen readers",
  async () => {
    setup();
    await user.click(screen.getByRole("button"));
    expect(
      screen.queryByText("Cursor keys can navigate dates")
    ).toBeInTheDocument();
    expect(
      screen.queryByText("Cursor keys can navigate dates")
    ).toHaveAttribute("aria-live");
  }
);

it(
  "the script slightly delays display of the information, " +
    "so screen readers are more likely to read it after information related to change of focus",
  async () => {
    setup();
    await user.click(screen.getByRole("button"));

    expect(
      screen.queryByText("Cursor keys can navigate dates")
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "next month" }));
    expect(
      screen.queryByText("Cursor keys can navigate dates")
    ).not.toBeInTheDocument();

    await user.click(screen.getByText("01"));
    expect(
      screen.queryByText("Cursor keys can navigate dates")
    ).toBeInTheDocument();
  }
);
```

### Solution

這邊要先調整一下，測試的 `render` 函式。

```tsx
function Comp(props: { value?: Date }) {
  const ref = useRef<HTMLElement>(null);
  const [focusWithinGrid, setFocusWithinGrid] = useState(false);

  return (
    <Calendar
      value={props.value}
      as={Dialog}
      initialFocusRef={ref}
      aria-label="Choose Date"
    >
      <Calendar.Header>
        <Calendar.Title />
        <Calendar.Button action="previous month" />
        <Calendar.Button action="next month" />
        <Calendar.Button action="previous year" />
        <Calendar.Button action="next year" />
      </Calendar.Header>

      <MonthCalendar.Grid
        onFocusCapture={(event) =>
          setFocusWithinGrid(
            event.currentTarget.contains(document.activeElement)
          )
        }
        onBlurCapture={() => setFocusWithinGrid(false)}
      >
        <MonthCalendar.ColumnHeader />

        <MonthCalendar.GridCell ref={ref}>
          {(date) => (
            <DatePicker.Button action={{ type: "select date", value: date }}>
              {format(date, "dd")}
            </DatePicker.Button>
          )}
        </MonthCalendar.GridCell>
      </MonthCalendar.Grid>

      <span aria-live="polite">
        {focusWithinGrid && "Cursor keys can navigate dates"}
      </span>
    </Calendar>
  );
}

function setup(initialValue?: Date) {
  user.setup();
  return render(
    <DatePicker value={initialValue}>
      <DatePicker.Field />
      <DatePicker.Button action={{ type: "trigger calendar" }}>
        {({ value }) =>
          value ? `change date, ${format(value, "MM/dd/yyyy")}` : "choose date"
        }
      </DatePicker.Button>

      <DatePicker.Description>(date format: mm/dd/yyyy)</DatePicker.Description>

      {({ open, value }) => open && <Comp value={value} />}
    </DatePicker>
  );
}
```

這邊注意到，  
規格有要求打開對話視窗的時候，  
需要將焦點對焦在 用戶選擇的時間 或 當前時間。

透過 `Dialog` 設置 `initialFocusRef` 可以控制一開始的對焦元件，  
但我們需要拿到 `MonthCalendar` 中用戶選擇的時間 或 當前時間 的日期選擇按鈕。
這需要修改 `MonthCalendar.GridCell` 的實作。

```tsx
export type GridCellProps = EP<
  "td",
  {
    children?: (date: Date) => ReactNode;
  }
>;
const GridCell = forwardRef<HTMLElement, GridCellProps>((_props, _ref) => {
  const context = useMonthCalendarContext(
    `<GridCell /> cannot be rendered outside <MonthCalendar />`
  );
  const { children, ...props } = _props;

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
            const ref = isSameDay(day, context.focus) ? _ref : undefined;

            if (isValidElement(element)) {
              return (
                <td key={index} {...props}>
                  {cloneElement(element, { ...element.props, tabIndex, ref })}
                </td>
              );
            }

            return (
              <td
                key={index}
                {...props}
                tabIndex={tabIndex}
                ref={ref as RefObject<HTMLTableCellElement>}
              >
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

這裡，`ref` 只需要捕捉需要 `focus` 那天即可，其餘的配置 `undefined`。
調整完程式碼要跑一次單元測試，確保以前開發的規格沒有出現錯誤。

## Spec: Grid

對話視窗中的月曆必須標記為 [grid]，  
建議使用 [table] 會有額外的 bonus。

```tsx
it("identifies the table element as a grid widget", async () => {
  setup();
  await user.click(screen.getByRole("button", { name: /choose date/ }));
  expect(screen.queryByRole("grid")).toBeInTheDocument();
});

it("identifies the element that provides the accessible name for the grid", async () => {
  setup();
  await user.click(screen.getByRole("button", { name: /choose date/ }));
  expect(screen.queryByRole("grid")).toHaveAccessibleName();
});
```

### Solution

這部分由 [如何製作月曆 date grid 【 calendar | 我不會寫 React Component 】](./calendar/month-calendar.md) 實作了，  
故這邊跳過。

## Spec: selected

為了跟 `input` 產生呼應，被選擇日期按鈕必須有 `aria-selected` 屬性。

```tsx
it(
  "only set on the cell containing the currently selected date; " +
    "no other cells have aria-selected specified",
  async () => {
    setup(new Date(0));
    await user.click(screen.getByRole("button"));
    expect(screen.getByText("01"))
      //
      .toHaveAttribute("aria-selected", "true");
  }
);
```

### Solution

```tsx
export type ButtonProps = PCP<
  "button",
  {
    children?: ReactNode | ((state: State) => ReactNode);
    action: Action;
  }
>;
const Button = forwardRef<HTMLButtonElement, ButtonProps>((_props, ref) => {
  const [state, dispatch] = useDatePickerContext(
    `<DatePicker.Button /> cannot be rendered outside <DatePicker />`
  );

  const { action, children, ...props } = _props;

  const onClick = () => dispatch(action);

  let element: ReactNode | null = null;
  if (typeof children === "function") {
    element ??= children(state);
  } else {
    element ??= children;
  }

  if (action.type === "select date") {
    const isSelected = state.value && isSameDay(action.value, state.value);

    return (
      <button
        {...props}
        type="button"
        onClick={onClick}
        ref={ref}
        aria-selected={isSelected}
      >
        {element}
      </button>
    );
  }

  return (
    <button {...props} type="button" onClick={onClick} ref={ref}>
      {element}
    </button>
  );
});
```

## 名詞對照

| 中文     | 英文        |
| -------- | ----------- |
| 日期選擇 | date picker |
| 對話視窗 | dialog      |

[dialog]: ./dialog/intro.md
[grid]: https://www.w3.org/WAI/ARIA/apg/patterns/grid/
[table]: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/table
