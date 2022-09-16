# 如何製作日期選擇 Date Picker 1【 我不會寫 React Component 】

hashtags: `#react`, `#components`, `#accessibility`, `#datepicker`

## 關於 Date Picker Dialog

[date picker][date-picker] 是一種複合元件，  
包含了 時間輸入欄位 跟 實作了 [對話視窗][dialog] 規格的 [日曆元件][calendar]。

這個元件讓用戶可以選擇從日曆中選擇日期，並帶入到時間輸入欄位。  
如果輸入欄位為空 或是 選擇之日期不合格，則打開日曆時會對焦在當天日期，  
反之，則會對焦在輸入欄位選擇的日期上。

## Spec: Textbox

時間欄位的輸入格式必須被標記在 `aria-describedby`，讓它可以被輔助科技描述。

```tsx
function setup() {
  return render(
    <DatePicker value={new Date(0)}>
      <DatePicker.Field />

      <DatePicker.Description>
        (<span>date format:</span> yyyy-mm-dd)
      </DatePicker.Description>
    </DatePicker>
  );
}

describe("Textbox", () => {
  it("identifies the element that provides an accessible description for the textbox", () => {
    expect(screen.getByRole("input"))
      //
      .toHaveAccessibleDescription("(date format: mm/dd/yyyy)");
  });
});
```

### Solution

```tsx
type DescriptionProps = ComponentProps<"span">;
function Description(props: DescriptionProps) {
  return <span {...props} />;
}

type FieldProps = ComponentProps<"input">;
function Field(props: FieldProps) {
  return <input type="text" {...props} />;
}

type DatePickerProps = ComponentProps<"div"> & {
  value?: Date;
};
export function DatePicker(props: DatePickerProps) {
  const id = useId();
  const input_describe = id + "input_describe";
  return (
    <div>
      {Children.map(props.children, (element) => {
        if (!isValidElement(element)) {
          return element;
        }

        if (element.type === Field) {
          return cloneElement(element, {
            ...element.props,
            "aria-describedby": input_describe,
          });
        }

        if (element.type === Description) {
          return cloneElement(element, {
            ...element.props,
            id: input_describe,
          });
        }

        return element;
      })}
    </div>
  );
}

DatePicker.Field = Field;
DatePicker.Description = Description;
```

這邊用到 [React.Children.map][reactchildrenmap]，  
並透過 [React.cloneElement][cloneelement] 拋入 `aria-describedby` 跟 `id`，  
這樣可以確定他們的數值一致，  
不過這樣做的彈性不夠，我們接下來會將它改成 [compound components][compound-components]。

## Spec: Button

在選擇日期之後，  
元件按鈕的可達性名稱要從 "Choose Date" 更改為 "Change Date, DATE_STRING" (DATE_STRING 是當前選擇的日期)。  
所以，當對話視窗關閉，焦點返回到按鈕時，輔助科技就會報讀出用戶當前選擇的日期。

```tsx
describe("Choose Date Button", () => {
  it(`the initial value of accessible name is "choose date"`, () => {
    expect(
      screen.getByRole("button", { name: /choose date/ })
    ).toBeInTheDocument();
  });

  it(`when user click button, should open dialog`, async () => {
    expect(screen.getByRole("dialog")).not.toBeInTheDocument();
    const button = screen.getByRole("button", { name: /choose date/ });
    await user.click(button);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it(`when users select a date, the accessible name is changed to \
      "change date, date_string" where date_string is the selected date`, async () => {
    const button = screen.getByRole("button", { name: /choose date/ });
    await user.click(button);
    await user.click(screen.getByRole(/(grid)?cell/, { name: "02" }));
    expect(button).toHaveAccessibleName("change date, 02/01/1970");
  });
});
```

### Solution

這邊比較特別的是，我做了以下的 API 設計，  
讓元件可以除了接收一般的 `ReactNode` 之外，  
也可以直接接收 [render props][render-props]。

```tsx
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

      {({ open, value }) =>
        open && (
          <Calendar value={value} as={Dialog}>
            <Calendar.Header>
              <Calendar.Title as={Dialog.Title} />
              <Calendar.Button action="previous month" />
              <Calendar.Button action="next month" />
              <Calendar.Button action="previous year" />
              <Calendar.Button action="next year" />
            </Calendar.Header>

            <MonthCalendar>
              <MonthCalendar.ColumnHeader />

              <MonthCalendar.GridCell>
                {(date) => (
                  <DatePicker.Button
                    action={{ type: "select date", value: date }}
                  >
                    {format(date, "dd")}
                  </DatePicker.Button>
                )}
              </MonthCalendar.GridCell>
            </MonthCalendar>

            <div aria-live="polite">Cursor keys can navigate dates</div>
          </Calendar>
        )
      }
    </DatePicker>
  );
}
```

透過 [compound components][compound-components]，  
我們可以在 provider 的 scope 內，共享同一狀態。

```tsx
type Action =
  | { type: "trigger calendar" }
  | { type: "select date"; value: Date };
type State = {
  open: boolean;
  value?: Date;
  input_describe: string;
};
const Context = createContext<[State, Dispatch<Action>] | null>(null);
function reducer(state: State, action: Action) {
  if (action.type === "trigger calendar") {
    return { ...state, open: !state.open };
  }
  if (action.type === "select date") {
    return { ...state, value: action.value };
  }
  return state;
}
function useDatePickerContext(error: string) {
  const context = useContext(Context);
  if (!context) {
    throw new Error(error);
  }
  return context;
}
```

開啟 `Calendar` 的 `Button`，  
這邊設計了 `forwardRef`，因為我們在 `MonthCalendar` 用到 `ref` 來 `focus`。

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

  return (
    <button {...props} type="button" onClick={onClick} ref={ref}>
      {element}
    </button>
  );
});
```

這邊將前面的 `input_describe` 改成透過 `Context` 傳遞。

```tsx
type DescriptionProps = ComponentProps<"span">;
function Description(props: DescriptionProps) {
  const [{ input_describe }] = useDatePickerContext(
    `<DatePicker.Description /> cannot be rendered outside <DatePicker />`
  );

  return <span id={input_describe} {...props} />;
}

type FieldProps = ComponentProps<"input">;
function Field(props: FieldProps) {
  const [{ input_describe }] = useDatePickerContext(
    `<DatePicker.Field /> cannot be rendered outside <DatePicker />`
  );

  return <input type="text" aria-describedby={input_describe} {...props} />;
}
```

```tsx
type DatePickerProps = PCP<
  "div",
  {
    value?: Date;
    children: (ReactNode | ((state: State) => ReactNode))[];
  }
>;
export function DatePicker(props: DatePickerProps) {
  const id = useId();
  const context = useReducer(reducer, {
    input_describe: id + "input_describe",
    open: false,
    value: props.value,
  });

  return (
    <Context.Provider value={context}>
      <div>
        {props.children?.map((element, index) => {
          if (typeof element === "function") {
            return <Fragment key={index}>{element(context[0])}</Fragment>;
          }

          return <Fragment key={index}>{element}</Fragment>;
        })}
      </div>
    </Context.Provider>
  );
}
```

## 名詞對照

| 中文     | 英文        |
| -------- | ----------- |
| 日期選擇 | date picker |
| 對話視窗 | dialog      |

[date-picker]: https://www.w3.org/WAI/ARIA/apg/example-index/dialog-modal/datepicker-dialog
[dialog]: ./dialog/intro.md
[calendar]: ./calendar/month-calendar.md
[reactchildrenmap]: https://reactjs.org/docs/react-api.html#reactchildrenmap
[cloneelement]: https://reactjs.org/docs/react-api.html#cloneelement
[render-props]: https://reactjs.org/docs/render-props.html
[compound-components]: ../calendar/compound-components.md
