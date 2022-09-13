# 如何製作月曆 date grid 【 calendar | 我不會寫 React Component 】

hashtags: `#react`, `#calendar`

## About

[calendar] 是一種劃分時間的系統。  
透過定義時間段為一個單位下去規劃，  
時間段像是 (一天，一週，一個月，一年)。

目前世界主要採用的是 [公曆][gregorian-calendar]，
電腦科學採用的是 [unix time][unix-time]

常常被應用在 [date picker][date-picker] 上，  
[date picker][date-picker] 是一種複合元件，  
基於從簡單元件開始製作，這篇不涉及 [date picker][date-picker] 部分的規格。

## Spec: Grid

月曆使用了 [grid] pattern 讓用戶可以知道日期相關資訊，  
可以透過跟 button 的組合，讓用戶選擇其中的天數。

```tsx
it("Identifies the table element as a grid widget.", () => {
  render(<MonthCalendar />);

  expect(screen.getByRole("grid")).toBeInTheDocument();
});
```

### Solution

這邊用 `table` 元素的理由是，  
藉由 `table` 的隱含 ARIA role，  
我們可以不用多寫 `aria-role`，
`th`： [columnheader][columnheader-role]，  
`tr`： [row][row-role]，  
`td`： [cell][gridcell-role]。

```tsx
export const Calendar = () => {
  return <table role="grid"></table>;
};
```

## Spec: Days in Month

當 `focus` 為 00:00:00 UTC 時，  
要正確的渲染該月份的日期，
且第一天是星期四。

```tsx
describe("If focus on January 1970", () => {
  it("Should render days in month correctly", () => {
    const { container } = render(<MonthCalendar focus={new Date(0)} />);

    eachDayOfInterval({
      start: new Date(0),
      end: endOfMonth(new Date(0)),
    }).forEach((day) =>
      expect(container).toHaveTextContent(RegExp(format(day, "dd")))
    );
  });

  it("the first day should Thursday", () => {
    render(<MonthCalendar focus={new Date(0)} />);

    expect(screen.getAllByRole(/(grid)?cell/).at(4))
      //
      .toHaveTextContent("01");
  });

  it("If focus on January 1970 first, then change focus to February 1970", () => {
    const first = new Date(0);
    const { rerender } = render(
      <MonthCalendar focus={first} key={first.valueOf()} />
    );
    expect(screen.getAllByRole(/(grid)?cell/).at(4))
      //
      .toHaveTextContent("01");

    const second = add(new Date(0), { months: 1 });
    rerender(<MonthCalendar focus={second} key={second.valueOf()} />);
    expect(screen.getAllByRole(/(grid)?cell/).at(0))
      //
      .toHaveTextContent("01");
  });
});
```

### Solution

這邊使用 [date-dns] 跟 [ramda] 幫我們處理掉太 low-level 的操作。

```tsx
import {
  eachDayOfInterval,
  endOfMonth,
  format,
  getDay,
  startOfMonth,
} from "date-fns";
import { concat, repeat, splitEvery } from "ramda";

const getDatesInMonth = (focusOn: Date) =>
  eachDayOfInterval({
    start: startOfMonth(focusOn),
    end: endOfMonth(focusOn),
  });

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
      <tbody>
        {table.map((row, index) => (
          <tr key={index}>
            {row.map((day, index) => (
              <td key={index}>{day ? format(day, "dd") : null}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};
```

## Spec: Roving tabindex Initial

當元件初始化的時候，  
將需要被包含進表序列的元素，設成 `tabindex="0"`，  
其他需要可聚焦的元素設成 `tabindex="-1"`。

```tsx
describe("When the component container is loaded or created", () => {
  it("If focusOn is January 1970, should be focus on January 1970", () => {
    render(<MonthCalendar focus={new Date(0)} />);

    expect(document.activeElement)
      //
      .toHaveTextContent("01");
  });

  it("Default focus on today", () => {
    render(<MonthCalendar />);

    expect(document.activeElement)
      //
      .toHaveTextContent(RegExp(format(new Date(), "dd")));
  });

  it(`Set tabindex="0" on the element that will initially be included in the tab sequence`, () => {
    render(<MonthCalendar />);

    expect(document.activeElement)
      //
      .toHaveAttribute("tabindex", "0");
  });

  it(`Set tabindex="-1" on all other focusable elements it contains.`, () => {
    Array.from(
      render(<MonthCalendar />).container.querySelectorAll(`[tabindex]`)
    )
      .filter((el) => el !== document.activeElement)
      .forEach((el) => expect(el).toHaveAttribute("tabindex", "-1"));
  });
});
```

### Solution

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
    const user = userEvent.setup();

    render(<MonthCalendar focus={new Date(0)} />);

    const element = screen.getByText(format(new Date(0), "dd"));
    expect(element).toHaveAttribute("tabindex", "0");

    await user.keyboard("[ArrowDown]");
    expect(element).toHaveAttribute("tabindex", "-1");

    await user.keyboard("[ArrowUp]");
    expect(element).toHaveAttribute("tabindex", "0");

    await user.keyboard("[ArrowLeft]");
    expect(element).toHaveAttribute("tabindex", "-1");

    await user.keyboard("[ArrowRight]");
    expect(element).toHaveAttribute("tabindex", "0");
  });

  it(`set tabindex="0" on the element that will become focused`, async () => {
    const user = userEvent.setup();

    let current = new Date(0);
    render(<MonthCalendar focus={current} />);

    const getByText = screen.getByText;
    expect(getByText(format(current, "dd")))
      //
      .toHaveAttribute("tabindex", "0");

    await user.keyboard("[ArrowDown]");
    current = add(current, { weeks: 1 });
    expect(getByText(format(current, "dd")))
      //
      .toHaveAttribute("tabindex", "0");

    await user.keyboard("[ArrowUp]");
    current = sub(current, { weeks: 1 });
    expect(getByText(format(current, "dd")))
      //
      .toHaveAttribute("tabindex", "0");

    await user.keyboard("[ArrowLeft]");
    current = sub(current, { days: 1 });
    expect(getByText(format(current, "dd")))
      //
      .toHaveAttribute("tabindex", "0");

    await user.keyboard("[ArrowRight]");
    current = add(current, { days: 1 });
    expect(getByText(format(current, "dd")))
      //
      .toHaveAttribute("tabindex", "0");

    await user.keyboard("[Home]");
    current = startOfWeek(current);
    expect(getByText(format(current, "dd")))
      //
      .toHaveAttribute("tabindex", "0");

    await user.keyboard("[End]");
    current = endOfWeek(current);
    expect(getByText(format(current, "dd")))
      //
      .toHaveAttribute("tabindex", "0");
  });

  it(`Set focus, element.focus(), on the element that has tabindex="0"`, async () => {
    const user = userEvent.setup();

    let current = new Date(0);
    render(<MonthCalendar focus={current} />);

    const getByText = screen.getByText;
    expect(getByText(format(current, "dd"))).toHaveFocus();

    await user.keyboard("[ArrowDown]");
    current = add(current, { weeks: 1 });
    expect(getByText(format(current, "dd"))).toHaveFocus();

    await user.keyboard("[ArrowUp]");
    current = sub(current, { weeks: 1 });
    expect(getByText(format(current, "dd"))).toHaveFocus();

    await user.keyboard("[ArrowLeft]");
    current = sub(current, { days: 1 });
    expect(getByText(format(current, "dd"))).toHaveFocus();

    await user.keyboard("[ArrowRight]");
    current = add(current, { days: 1 });
    expect(getByText(format(current, "dd"))).toHaveFocus();

    await user.keyboard("[Home]");
    current = startOfWeek(current);
    expect(getByText(format(current, "dd"))).toHaveFocus();

    await user.keyboard("[End]");
    current = endOfWeek(current);
    expect(getByText(format(current, "dd"))).toHaveFocus();
  });
});
```

### Solution

透過 `useReducer` 來處理 `focus` 的操作邏輯。

```tsx
import {
  add,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  getDay,
  isSameDay,
  startOfMonth,
  startOfWeek,
  sub,
} from "date-fns";
import { concat, repeat, splitEvery } from "ramda";
import { useEffect, useReducer } from "react";

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

function reducer(focusOn: Date, key: string) {
  if (key === "ArrowDown") {
    return add(focusOn, { weeks: 1 });
  }

  if (key === "ArrowUp") {
    return sub(focusOn, { weeks: 1 });
  }

  if (key === "ArrowLeft") {
    return sub(focusOn, { days: 1 });
  }

  if (key === "ArrowRight") {
    return add(focusOn, { days: 1 });
  }

  if (key === "Home") {
    return startOfWeek(focusOn);
  }

  if (key === "End") {
    return endOfWeek(focusOn);
  }

  return focusOn;
}

type MonthCalendarProps = {
  focus?: Date;
};
export const MonthCalendar = (props: MonthCalendarProps) => {
  const [focusOn, dispatch] = useReducer(reducer, props.focus ?? new Date());

  useEffect(() => {
    const keydown = ({ key }: KeyboardEvent) => dispatch(key);

    window.addEventListener("keydown", keydown);
    return () => {
      window.removeEventListener("keydown", keydown);
    };
  }, [dispatch]);

  const days = concat(
    repeat(undefined, getDay(startOfMonth(focusOn))),
    getDatesInMonth(focusOn)
  );

  const table = splitEvery(7, days);

  return (
    <table role="grid">
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

## Spec: WeekDay Header

```tsx
describe("WeekDay Header", () => {
  it.each([
    ["Su", "Sunday"],
    ["Mo", "Monday"],
    ["Tu", "Tuesday"],
    ["We", "Wednesday"],
    ["Th", "Thursday"],
    ["Fr", "Friday"],
    ["Sa", "Saturday"],
  ])("the day %s in the column headers", (name, abbr) => {
    render(<MonthCalendar />);

    const el = screen.getByRole("columnheader", { name });
    expect(el).toBeInTheDocument();
    expect(el).toHaveAttribute("abbr", abbr);
  });
});
```

### Solution

```tsx
import {
  add,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  getDay,
  isSameDay,
  startOfMonth,
  startOfWeek,
  sub,
} from "date-fns";
import { concat, repeat, splitEvery } from "ramda";
import { useEffect, useReducer } from "react";

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

function reducer(focusOn: Date, key: string) {
  if (key === "ArrowDown") {
    return add(focusOn, { weeks: 1 });
  }

  if (key === "ArrowUp") {
    return sub(focusOn, { weeks: 1 });
  }

  if (key === "ArrowLeft") {
    return sub(focusOn, { days: 1 });
  }

  if (key === "ArrowRight") {
    return add(focusOn, { days: 1 });
  }

  if (key === "Home") {
    return startOfWeek(focusOn);
  }

  if (key === "End") {
    return endOfWeek(focusOn);
  }

  return focusOn;
}

type MonthCalendarProps = {
  focus?: Date;
};
export const MonthCalendar = (props: MonthCalendarProps) => {
  const [focusOn, dispatch] = useReducer(reducer, props.focus ?? new Date());

  useEffect(() => {
    const keydown = ({ key }: KeyboardEvent) => dispatch(key);

    window.addEventListener("keydown", keydown);
    return () => {
      window.removeEventListener("keydown", keydown);
    };
  }, [dispatch]);

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

## 名詞對照

| 中文           | 英文                   |
| -------------- | ---------------------- |
| 元素           | element                |
| 隱含 ARIA role | implicit ARIA role     |
| 複合元件       | compound components    |
| 表序列         | tab sequence           |
| 輔助科技       | assistive technologies |
| 組合型         | composite              |
| 組件           | widget                 |
| 可聚焦         | focusable              |

[grid]: https://www.w3.org/WAI/ARIA/apg/patterns/grid/
[date-picker]: https://www.w3.org/WAI/ARIA/apg/example-index/dialog-modal/datepicker-dialog
[row-role]: https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/row_role
[gridcell-role]: https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/gridcell_role
[columnheader-role]: https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/columnheader_role
[calendar]: https://en.wikipedia.org/wiki/Calendar
[unix-time]: https://en.wikipedia.org/wiki/Unix_time
[gregorian-calendar]: https://en.wikipedia.org/wiki/Gregorian_calendar
[date-fns]: https://date-fns.org/
[ramda]: https://ramdajs.com/
