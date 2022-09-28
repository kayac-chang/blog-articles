# 如何製作日期選擇 Date Picker 3【 date picker | 我不會寫 React Component 】

hashtags: `#react`, `#components`, `#accessibility`, `#datepicker`

本篇接續前篇 [如何製作日期選擇 Date Picker 2【 我不會寫 React Component 】](./datepicker-2.md)  
可以先看完上一篇再接續此篇。

## Spec: Choose Date Button

按下 <kbd>Space</kbd> 或是 <kbd>Enter</kbd> 時，  
會打開日期選擇對話視窗。

將焦點對焦到用戶選擇的日期上，  
如果當前還沒選擇日期則對焦到當天日期。

```tsx
describe("choose date button", () => {
  describe("space", () => {
    it("open the date picker dialog", async () => {
      setup(new Date(0));
      screen.getByRole("button").focus();
      await user.keyboard("{Space}");
      expect(screen.queryByRole("dialog")).toBeInTheDocument();
    });

    it("move focus to selected date, i.e., the date displayed in the date input text field", async () => {
      setup(new Date(0));
      screen.getByRole("button").focus();
      await user.keyboard("{Space}");
      expect(screen.queryByText("01")).toHaveFocus();
    });

    it("no date has been selected, places focus on the current date.", async () => {
      setup();
      screen.getByRole("button").focus();
      await user.keyboard("{Space}");
      expect(screen.queryByText(new Date().getDate())).toHaveFocus();
    });
  });

  describe("enter", () => {
    it("open the date picker dialog", async () => {
      setup(new Date(0));
      screen.getByRole("button").focus();
      await user.keyboard("{Enter}");
      expect(screen.queryByRole("dialog")).toBeInTheDocument();
    });

    it("move focus to selected date, i.e., the date displayed in the date input text field", async () => {
      setup(new Date(0));
      screen.getByRole("button").focus();
      await user.keyboard("{Enter}");
      expect(screen.queryByText("01")).toHaveFocus();
    });

    it("no date has been selected, places focus on the current date.", async () => {
      setup();
      screen.getByRole("button").focus();
      await user.keyboard("{Enter}");
      expect(screen.queryByText(new Date().getDate())).toHaveFocus();
    });
  });
});
```

### Solution

瀏覽器預設，當用戶按下 <kbd>Enter</kbd> 時，`button` 會被點擊，
但 <kbd>Space</kbd> 還是需要我們自己實作。

```tsx
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

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Space") {
      event.preventDefault();
      return dispatch(action);
    }
  };

  return (
    <button
      {...props}
      type="button"
      onClick={onClick}
      onKeyDown={onKeyDown}
      ref={ref}
    >
      {element}
    </button>
  );
});
```

## Spec: Close Dialog

當用戶按下 <kbd>Esc</kbd> 時，  
必須關閉 `dialog` 並對焦於 `choose date` 按鈕上。

```tsx
describe("esc", () => {
  it('closes the dialog and returns focus to the "choose date" button', async () => {
    setup();
    screen.getByRole("button", { name: "choose date" }).focus();
    await user.keyboard("{Enter}");
    expect(screen.queryByRole("dialog")).toBeInTheDocument();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "choose date" })).toHaveFocus();
  });
});
```

### Solution

因為我們在 [如何製作對話視窗 interaction【 dialog | 我不會寫 React Component 】](./dialog/interaction.md) 已經實作這項規格，  
我們只要記得將 `previousFocusRef` 拋進 `Dialog` 就行了。

```tsx
function TestCalendar(props: {
  value?: Date;
  onDismiss: () => void;
  previousFocusRef: RefObject<HTMLElement>;
}) {
  const ref = useRef<HTMLTableCellElement>(null);
  const [focusWithinGrid, setFocusWithinGrid] = useState(false);

  return (
    <Calendar
      value={props.value}
      as={Dialog}
      initialFocusRef={ref}
      previousFocusRef={props.previousFocusRef}
      aria-label="Choose Date"
      onDismiss={props.onDismiss}
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

function TestDatePicker(props: { value?: Date }) {
  const previousFocus = useRef<HTMLButtonElement>(null);
  return (
    <DatePicker value={props.value}>
      <DatePicker.Field />
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

## 名詞對照

| 中文     | 英文        |
| -------- | ----------- |
| 日期選擇 | date picker |
| 對話視窗 | dialog      |
