# 如何製作月曆 integration【 calendar | 我不會寫 React Component 】

hashtags: `#react`, `#components`, `#accessibility`, `#calendar`, `#control`

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
    "sets focus on the same day of the same week." +
      "if that day does not exist, then moves focus to the same day of the previous or next week.",
    async () => {
      setup();

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
});
```

## Spec: Roving tabindex Navigation

當焦點目前落在元件上時，  
可以用 箭頭上下左右 跟 Home, End 下去移動焦點，  
且 `tabindex="0"` 會跟著當前焦點移動。

當按 <kbd>Arrow Up</kbd> 的時候，焦點要往上一格。
當按 <kbd>Arrow Down</kbd> 的時候，焦點要往下一格。
當按 <kbd>Arrow Left</kbd> 的時候，焦點要往左一格。
當按 <kbd>Arrow Right</kbd> 的時候，焦點要往右一格。
當按 <kbd>Home</kbd> 的時候，焦點要移動到該週第一天。
當按 <kbd>End</kbd> 的時候，焦點要移動到該週最後一天。

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
});
```

### Refactoring 重構 Calendar

將狀態有關的操作都集中在 `Calendar`。

```tsx
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
