# 如何製作月曆 integration【 calendar | 我不會寫 React Component 】

hashtags: `#react`, `#calendar`

本篇接續前篇 [如何製作月曆 control【 calendar | 我不會寫 React Component 】](./calendar.md)  
可以先看完上一篇在接續此篇。

## Integration Test 整合測試

> [整合多方資源進行測試，確保模組與模組之間的互動行為正確無誤，也讓不同模組在各自開發維護的過程中不會因為功能調整而遭到破壞。][integration-test]
> 寶哥

首先，我們要先決定哪些規格是需要被整合測試的。

- 按下按鈕可以控制月曆標頭顯示的年月跟日期表格
- 透過鍵盤可以控制月曆標頭年月跟日期表格

以上都涉及到 `Calendar` 跟 `MonthCalendar` 之間的交互行為。

```tsx
describe("Integration: Calendar with MonthCalendar", () => {
  const setup = () => {
    userEvent.setup();
    render(<Calendar value={new Date(0)} />);
  };

  it("when click previous/next month, should change the month and year displayed in the calendar", async () => {
    setup();

    const nextMonth = screen.getByRole("button", { name: /next month/ });
    const prevMonth = screen.getByRole("button", { name: /previous month/ });
    const nextYear = screen.getByRole("button", { name: /next year/ });
    const prevYear = screen.getByRole("button", { name: /previous year/ });

    expect(screen.getAllByRole(/(grid)?cell/).at(4)).toHaveTextContent("01");
    expect(screen.getAllByRole(/(grid)?cell/).at(-1)).toHaveTextContent("31");
    expect(screen.getByRole("heading")).toHaveTextContent("January 1970");

    await userEvent.click(nextMonth);
    expect(screen.getAllByRole(/(grid)?cell/).at(0)).toHaveTextContent("01");
    expect(screen.getAllByRole(/(grid)?cell/).at(-1)).toHaveTextContent("28");
    expect(screen.getByRole("heading")).toHaveTextContent("February 1970");

    await userEvent.click(prevMonth);
    expect(screen.getAllByRole(/(grid)?cell/).at(4)).toHaveTextContent("01");
    expect(screen.getAllByRole(/(grid)?cell/).at(-1)).toHaveTextContent("31");
    expect(screen.getByRole("heading")).toHaveTextContent("January 1970");

    await userEvent.click(nextYear);
    expect(screen.getAllByRole(/(grid)?cell/).at(5)).toHaveTextContent("01");
    expect(screen.getAllByRole(/(grid)?cell/).at(-1)).toHaveTextContent("31");
    expect(screen.getByRole("heading")).toHaveTextContent("January 1971");

    await userEvent.click(prevYear);
    expect(screen.getAllByRole(/(grid)?cell/).at(4)).toHaveTextContent("01");
    expect(screen.getAllByRole(/(grid)?cell/).at(-1)).toHaveTextContent("31");
    expect(screen.getByRole("heading")).toHaveTextContent("January 1970");
  });

  it("user can change month/year using keyboard", async () => {
    setup();

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
    "Sets focus on the same day of the same week." +
      "If that day does not exist, then moves focus to the same day of the previous or next week.",
    async () => {
      setup();

      let index = screen
        .getAllByRole(/(grid)?cell/)
        .findIndex((el) => el === document.activeElement);
      expect(index % 7).toBe(4);

      await userEvent.keyboard("{PageDown}");
      index = screen
        .getAllByRole(/(grid)?cell/)
        .findIndex((el) => el === document.activeElement);
      expect(index % 7).toBe(0);

      await userEvent.keyboard("{PageUp}");
      index = screen
        .getAllByRole(/(grid)?cell/)
        .findIndex((el) => el === document.activeElement);
      expect(index % 7).toBe(4);

      await userEvent.keyboard("{Shift>}{PageDown}{/Shift}");
      index = screen
        .getAllByRole(/(grid)?cell/)
        .findIndex((el) => el === document.activeElement);
      expect(index % 7).toBe(5);

      await userEvent.keyboard("{Shift>}{PageUp}{/Shift}");
      index = screen
        .getAllByRole(/(grid)?cell/)
        .findIndex((el) => el === document.activeElement);
      expect(index % 7).toBe(4);
    }
  );
});
```

## Lifting State Up 拉升狀態

> Often, several components need to reflect the same changing data.
> We recommend lifting the shared state up to their closest common ancestor.

[Lifting State Up][lifting-state-up] 是撰寫 React 的一種技巧，
大致上是指：有多個元件都共享同一狀態時，建議將該狀態定在元件的共有父元件下。

接下來我會將原本放在 `MonthCalendar` 的狀態跟操作邏輯，拉升到 `Calendar`。

### 轉移測試到整合測試

- 首先把 `MonthCalendar.test.tsx` 的 `When the component contains focus and the user presses a navigation key` 整個搬到 `Calendar.test.tsx`。
- 將裡面的內容稍微調整一下。

```tsx
describe("When the component contains focus and the user presses a navigation key", () => {
  it(`set tabindex="-1" on the element that has tabindex="0"`, async () => {
    setup();

    const element = screen.getByText("01");
    expect(element).toHaveAttribute("tabindex", "0");

    await userEvent.keyboard("[ArrowDown]");
    expect(element).toHaveAttribute("tabindex", "-1");

    await userEvent.keyboard("[ArrowUp]");
    expect(element).toHaveAttribute("tabindex", "0");

    await userEvent.keyboard("[ArrowLeft]");
    expect(element).toHaveAttribute("tabindex", "-1");

    await userEvent.keyboard("[ArrowRight]");
    expect(element).toHaveAttribute("tabindex", "0");
  });

  it(`set tabindex="0" on the element that will become focused`, async () => {
    setup();

    let current = new Date(0);
    const getByText = screen.getByText;
    expect(getByText(format(current, "dd")))
      //
      .toHaveAttribute("tabindex", "0");

    await userEvent.keyboard("[ArrowDown]");
    current = add(current, { weeks: 1 });
    expect(getByText(format(current, "dd")))
      //
      .toHaveAttribute("tabindex", "0");

    await userEvent.keyboard("[ArrowUp]");
    current = sub(current, { weeks: 1 });
    expect(getByText(format(current, "dd")))
      //
      .toHaveAttribute("tabindex", "0");

    await userEvent.keyboard("[ArrowLeft]");
    current = sub(current, { days: 1 });
    expect(getByText(format(current, "dd")))
      //
      .toHaveAttribute("tabindex", "0");

    await userEvent.keyboard("[ArrowRight]");
    current = add(current, { days: 1 });
    expect(getByText(format(current, "dd")))
      //
      .toHaveAttribute("tabindex", "0");

    await userEvent.keyboard("[Home]");
    current = startOfWeek(current);
    expect(getByText(format(current, "dd")))
      //
      .toHaveAttribute("tabindex", "0");

    await userEvent.keyboard("[End]");
    current = endOfWeek(current);
    expect(getByText(format(current, "dd")))
      //
      .toHaveAttribute("tabindex", "0");
  });

  it(`Set focus, element.focus(), on the element that has tabindex="0"`, async () => {
    setup();

    let current = new Date(0);
    const getByText = screen.getByText;
    expect(getByText(format(current, "dd"))).toHaveFocus();

    await userEvent.keyboard("[ArrowDown]");
    current = add(current, { weeks: 1 });
    expect(getByText(format(current, "dd"))).toHaveFocus();

    await userEvent.keyboard("[ArrowUp]");
    current = sub(current, { weeks: 1 });
    expect(getByText(format(current, "dd"))).toHaveFocus();

    await userEvent.keyboard("[ArrowLeft]");
    current = sub(current, { days: 1 });
    expect(getByText(format(current, "dd"))).toHaveFocus();

    await userEvent.keyboard("[ArrowRight]");
    current = add(current, { days: 1 });
    expect(getByText(format(current, "dd"))).toHaveFocus();

    await userEvent.keyboard("[Home]");
    current = startOfWeek(current);
    expect(getByText(format(current, "dd"))).toHaveFocus();

    await userEvent.keyboard("[End]");
    current = endOfWeek(current);
    expect(getByText(format(current, "dd"))).toHaveFocus();
  });
});
```

### Refactoring 重構 MonthCalendar

將原本的 `useReducer` 跟 `useEffect` 相關邏輯移除，  
讓 `MonthCalendar` 變成 `stateless component`。

```tsx
import {
  eachDayOfInterval,
  endOfMonth,
  format,
  getDay,
  isSameDay,
  startOfMonth,
} from "date-fns";
import { concat, repeat, splitEvery } from "ramda";

const getDatesInMonth = (focusOn: Date) =>
  eachDayOfInterval({
    start: startOfMonth(focusOn),
    end: endOfMonth(focusOn),
  });

const focus = (isFocus: boolean) =>
  isFocus
    ? {
        tabIndex: 0,
        ref: (el: HTMLElement | null) => el?.focus(),
      }
    : {
        tabIndex: -1,
      };

type MonthCalendarProps = {
  focus?: Date;
};
export const MonthCalendar = (props: MonthCalendarProps) => {
  const focusOn = props.focus ?? new Date();

  const days = concat(
    repeat(undefined, getDay(startOfMonth(focusOn))),
    getDatesInMonth(focusOn)
  );

  const table = splitEvery(7, days);

  return (
    <table role="grid">
      <thead>
        <tr>
          <th abbr="Sunday">Su</th>
          <th abbr="Monday">Mo</th>
          <th abbr="Tuesday">Tu</th>
          <th abbr="Wednesday">We</th>
          <th abbr="Thursday">Th</th>
          <th abbr="Friday">Fr</th>
          <th abbr="Saturday">Sa</th>
        </tr>
      </thead>
      <tbody>
        {table.map((row, index) => (
          <tr key={index}>
            {row.map((day, index) => (
              <td
                key={index}
                {...focus(Boolean(day && isSameDay(day, focusOn)))}
              >
                {day ? format(day, "dd") : null}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};
```

### Refactoring 重構 Calendar

我們將狀態有關的操作都集中在 `Calendar`。

```tsx
import { add, endOfWeek, format, startOfWeek, sub } from "date-fns";
import { Dispatch, ReactNode, useEffect, useReducer } from "react";

type Control = "previous" | "next" | "start of" | "end of";
type Unit = "year" | "month" | "week" | "day";
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
  if (action === "next week") {
    return add(date, { weeks: 1 });
  }
  if (action === "previous week") {
    return sub(date, { weeks: 1 });
  }
  if (action === "next day") {
    return add(date, { days: 1 });
  }
  if (action === "previous day") {
    return sub(date, { days: 1 });
  }
  if (action === "start of week") {
    return startOfWeek(date);
  }
  if (action === "end of week") {
    return endOfWeek(date);
  }
  return date;
}

const keymap =
  (dispatch: Dispatch<Action>) =>
  ({ shiftKey, key }: KeyboardEvent) => {
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
    if (key === "ArrowDown") {
      return dispatch("next week");
    }
    if (key === "ArrowUp") {
      return dispatch("previous week");
    }
    if (key === "ArrowLeft") {
      return dispatch("previous day");
    }
    if (key === "ArrowRight") {
      return dispatch("next day");
    }
    if (key === "Home") {
      return dispatch("start of week");
    }
    if (key === "End") {
      return dispatch("end of week");
    }
  };

type CalendarProps = {
  value?: Date;
  children?: (date: Date) => ReactNode;
};
export function Calendar(props: CalendarProps) {
  const [focus, dispatch] = useReducer(reducer, props.value ?? new Date());
  const previousMonth = () => dispatch("previous month");
  const nextMonth = () => dispatch("next month");
  const previousYear = () => dispatch("previous year");
  const nextYear = () => dispatch("next year");

  useEffect(() => {
    const keydown = keymap(dispatch);

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

        <h2 aria-live="polite">{format(focus, "MMMM yyyy")}</h2>

        <button type="button" aria-label="next month" onClick={nextMonth}>
          {">"}
        </button>

        <button type="button" aria-label="next year" onClick={nextYear}>
          {">>"}
        </button>
      </header>

      {props.children?.(focus)}
    </div>
  );
}
```

> **NOTICE**  
> 注意到我們把 `MonthCalendar` 從 `Calendar` 中移除。  
> 改成透過 [render props][render-props] ，由外部拋入元件。  
> 這樣的好處是 `Calendar` 不需要依賴於 `MonthCalendar`，  
> 可以根據使用情境下去拋入元件。  
> 這類操作叫 [inversion of control][inversion-of-control]。

### 調整一下整合測試

在整合測試這邊調整成透過 [render props][render-props] 拋入 `MonthCalendar`。

```tsx
const setup = () => {
  userEvent.setup();
  render(
    <Calendar value={new Date(0)}>
      {(focus) => <MonthCalendar focus={focus} />}
    </Calendar>
  );
};
```

Thanks for Unit Test and Integration Test。  
即便調整了很多邏輯跟架構，  
我們無需花太多時間心力重新檢查全部的功能。

## 名詞對照

| 中文     | 英文             |
| -------- | ---------------- |
| 整合     | Integration      |
| 日期表格 | Date Grid        |
| 拉升狀態 | Lifting State Up |
| 狀態     | State            |

[integration-test]: https://blog.miniasp.com/post/2019/02/18/Unit-testing-Integration-testing-e2e-testing#:~:text=%E6%92%B0%E5%AF%AB%E5%96%AE%E5%85%83%E6%B8%AC%E8%A9%A6%E3%80%82-,%E6%95%B4%E5%90%88%E6%B8%AC%E8%A9%A6,-(Integration%20testing)
[lifting-state-up]: https://reactjs.org/docs/lifting-state-up.html
[render-props]: https://reactjs.org/docs/render-props.html
[inversion-of-control]: https://kentcdodds.com/blog/inversion-of-control
