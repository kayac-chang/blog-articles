# 如何製作月曆 control【 calendar | 我不會寫 React Component 】

hashtags: `#react`, `#components`, `#accessibility`, `#calendar`, `#control`

本篇接續前篇 [如何製作月曆 date grid 【 calendar | 我不會寫 React Component 】](./month-calendar.md)  
可以先看完上一篇在接續此篇。

## Spec: 基本架構

雖然我們可以顯示當前月份的月曆，  
但我希望可以不只能顯示當前月份而已。  
為此我們需要一個建立兩個按鈕跟一個顯示當前年月的標籤。

```tsx
describe("calendar should render correctly", () => {
  it("should render button for change previous/next month/year", () => {
    render(<Calendar />);
    expect(screen.getAllByRole("button", { name: /previous month/ }));
    expect(screen.getAllByRole("button", { name: /next month/ }));
  });

  it("calendar heading displaying the month and year is marked up as a live region", () => {
    render(<Calendar value={new Date(0)} />);
    const element = screen.getByRole("heading");
    expect(element).toHaveTextContent("January 1970");
    expect(element).toHaveAttribute("aria-live", "polite");
  });
});
```

### Solution

`button` 標記 `type="button"` 是 best practice，  
也可以避免如果放在 `form` 裡面時變成 `submit`。

`h2` 寫死在這邊不太好但先這樣，之後可以再重構。  
標記 `aria-live` 會告知 `screen reader` 這個資訊會動態改變。

```tsx
import { format } from "date-fns";
import { MonthCalendar } from "./MonthCalendar";

type CalendarProps = {
  value?: Date;
};
export function Calendar(props: CalendarProps) {
  const current = props.value ?? new Date();

  return (
    <div>
      <header>
        <button type="button" aria-label="previous year">
          {"<<"}
        </button>

        <button type="button" aria-label="previous month">
          {"<"}
        </button>

        <h2 aria-live="polite">{format(current, "MMMM yyyy")}</h2>

        <button type="button" aria-label="next month">
          {">"}
        </button>

        <button type="button" aria-label="next year">
          {">>"}
        </button>
      </header>

      <MonthCalendar.Grid />
    </div>
  );
}
```

## Spec: 按鈕控制月曆顯示的月份

當按下前一個月或是後一個月的按鈕時，  
需要改變月曆當前顯示的月份。

```tsx
it("when click previous/next month, should change the month and year displayed in the calendar", async () => {
  userEvent.setup();
  render(<Calendar value={new Date(0)} />);

  const next = screen.getByRole("button", { name: /next month/ });
  const prev = screen.getByRole("button", { name: /previous month/ });

  expect(screen.getAllByRole(/(grid)?cell/).at(4)).toHaveTextContent("01");
  expect(screen.getAllByRole(/(grid)?cell/).at(-1)).toHaveTextContent("31");
  expect(screen.getByRole("heading")).toHaveTextContent("January 1970");

  await userEvent.click(next);
  expect(screen.getAllByRole(/(grid)?cell/).at(0)).toHaveTextContent("01");
  expect(screen.getAllByRole(/(grid)?cell/).at(-1)).toHaveTextContent("28");
  expect(screen.getByRole("heading")).toHaveTextContent("February 1970");

  await userEvent.click(prev);
  expect(screen.getAllByRole(/(grid)?cell/).at(4)).toHaveTextContent("01");
  expect(screen.getAllByRole(/(grid)?cell/).at(-1)).toHaveTextContent("31");
  expect(screen.getByRole("heading")).toHaveTextContent("January 1970");
});
```

### Solution

透過 `useReducer` 來處理 `value` 的操作邏輯，  
方便加入複雜邏輯時便於管理跟追蹤狀態變化。

```tsx
type Control = "previous" | "next";
type Unit = "year" | "month";
type Action = `${Control} ${Unit}`;
function reducer(date: Date, action: Action) {
  if (action === "previous month") {
    return sub(date, { months: 1 });
  }
  if (action === "next month") {
    return add(date, { months: 1 });
  }
  if (action === "previous year") {
    return sub(date, { years: 1 });
  }
  if (action === "next year") {
    return add(date, { years: 1 });
  }
  return date;
}

type CalendarProps = {
  value?: Date;
};
export function Calendar(props: CalendarProps) {
  const [current, dispatch] = useReducer(reducer, props.value ?? new Date());
  const previousMonth = () => dispatch("previous month");
  const nextMonth = () => dispatch("next month");
  const previousYear = () => dispatch("previous year");
  const nextYear = () => dispatch("next year");

  return (
    <div>
      <header>
        <button type="button" aria-label="previous year" onClick={previousYear}>
          {"<<"}
        </button>

        <button
          type="button"
          aria-label="previous month"
          onClick={previousMonth}
        >
          {"<"}
        </button>

        <h2 aria-live="polite">{format(current, "MMMM yyyy")}</h2>

        <button type="button" aria-label="next month" onClick={nextMonth}>
          {">"}
        </button>

        <button type="button" aria-label="next year" onClick={nextYear}>
          {">>"}
        </button>
      </header>

      <MonthCalendar.Grid focus={current} key={current.valueOf()} />
    </div>
  );
}
```

> **NOTICE**  
> 有注意到我在 `<MonthCalendar />` 使用了 `key` 嗎？  
> 原因是我要重置 `<MonthCalendar />` 裡面的 `focus` 狀態，  
> 如果你之前是用 `useEffect` 來刷新元件內部狀態，  
> 建議你改成這個重置的方式，這也是[官方建議的標準做法][resetting] (and more performance)。

## Spec: 鍵盤控制月曆顯示的月份

用戶可以用鍵盤控制：

- <kbd>PageDown</kbd>：將日曆格換到上一個月。
- <kbd>PageUp</kbd>：將日曆格換到下一個月。
- <kbd>Shift + PageDown</kbd>：將日曆格換到上一年。
- <kbd>Shift + PageUp</kbd>：將日曆格換到下一年。

切換後，將焦點對焦到同一週的同一天。  
如果那天不存在則對焦到上一週或下一週的同一天。

```tsx
it("user can change month/year using keyboard", async () => {
  userEvent.setup();
  render(<Calendar value={new Date(0)} />);

  await userEvent.keyboard("{PageDown}");
  expect(screen.getByRole("heading")).toHaveTextContent("February 1970");

  await userEvent.keyboard("{PageUp}");
  expect(screen.getByRole("heading")).toHaveTextContent("January 1970");

  await userEvent.keyboard("{Shift>}{PageDown}{/Shift}");
  expect(screen.getByRole("heading")).toHaveTextContent("January 1971");

  await userEvent.keyboard("{Shift>}{PageUp}{/Shift}");
  expect(screen.getByRole("heading")).toHaveTextContent("January 1970");
});

it(
  "sets focus on the same day of the same week." +
    "if that day does not exist, then moves focus to the same day of the previous or next week.",
  async () => {
    userEvent.setup();
    render(<Calendar value={new Date(0)} />);

    let index = screen
      .getAllByRole(/(grid)?cell/)
      .findIndex((el) => el.getAttribute("tabindex") === "0");
    expect(index % 7).toBe(4);

    await userEvent.keyboard("{PageDown}");
    index = screen
      .getAllByRole(/(grid)?cell/)
      .findIndex((el) => el.getAttribute("tabindex") === "0");
    expect(index % 7).toBe(0);

    await userEvent.keyboard("{PageUp}");
    index = screen
      .getAllByRole(/(grid)?cell/)
      .findIndex((el) => el.getAttribute("tabindex") === "0");
    expect(index % 7).toBe(4);

    await userEvent.keyboard("{Shift>}{PageDown}{/Shift}");
    index = screen
      .getAllByRole(/(grid)?cell/)
      .findIndex((el) => el.getAttribute("tabindex") === "0");
    expect(index % 7).toBe(5);

    await userEvent.keyboard("{Shift>}{PageUp}{/Shift}");
    index = screen
      .getAllByRole(/(grid)?cell/)
      .findIndex((el) => el.getAttribute("tabindex") === "0");
    expect(index % 7).toBe(4);
  }
);
```

### Solution

```tsx
type Control = "previous" | "next";
type Unit = "year" | "month";
type Action = `${Control} ${Unit}`;
function reducer(date: Date, action: Action) {
  if (action === "previous month") {
    return sub(date, { months: 1 });
  }
  if (action === "next month") {
    return add(date, { months: 1 });
  }
  if (action === "previous year") {
    return sub(date, { years: 1 });
  }
  if (action === "next year") {
    return add(date, { years: 1 });
  }
  return date;
}

type CalendarProps = {
  value?: Date;
};
export function Calendar(props: CalendarProps) {
  const [current, dispatch] = useReducer(reducer, props.value ?? new Date());
  const previousMonth = () => dispatch("previous month");
  const nextMonth = () => dispatch("next month");
  const previousYear = () => dispatch("previous year");
  const nextYear = () => dispatch("next year");

  useEffect(() => {
    const keydown = ({ shiftKey, key }: KeyboardEvent) => {
      if (shiftKey && key === "PageUp") {
        return dispatch("previous year");
      }
      if (shiftKey && key === "PageDown") {
        return dispatch("next year");
      }
      if (key === "PageUp") {
        return dispatch("previous month");
      }
      if (key === "PageDown") {
        return dispatch("next month");
      }
    };

    window.addEventListener("keydown", keydown);
    return () => {
      window.removeEventListener("keydown", keydown);
    };
  }, [dispatch]);

  return (
    <div>
      <header>
        <button type="button" aria-label="previous year" onClick={previousYear}>
          {"<<"}
        </button>

        <button
          type="button"
          aria-label="previous month"
          onClick={previousMonth}
        >
          {"<"}
        </button>

        <h2 aria-live="polite">{format(current, "MMMM yyyy")}</h2>

        <button type="button" aria-label="next month" onClick={nextMonth}>
          {">"}
        </button>

        <button type="button" aria-label="next year" onClick={nextYear}>
          {">>"}
        </button>
      </header>

      <MonthCalendar.Grid focus={current} key={current.valueOf()} />
    </div>
  );
}
```

## Bug !?

這邊有個 Bug 是，  
當用戶使用 <kbd>Arrow</kdb> 來操作時，  
月曆上面的 年月標題 沒有跟著改變。

這其實符合我的預期，  
我們會在下一個章節解決這個問題。

[resetting]: https://beta.reactjs.org/learn/you-might-not-need-an-effect#resetting-all-state-when-a-prop-changes
