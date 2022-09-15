# 如何製作月曆 date grid 【 calendar | 我不會寫 React Component 】

hashtags: `#react`, `#components`, `#accessibility`, `#calendar`, `#date-grid`

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
it("identifies the table element as a grid widget", () => {
  render(<MonthCalendar.Grid />);

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
const Grid = () => {
  return <table role="grid"></table>;
};

export const MonthCalendar = {
  Grid,
};
```

## Spec: Days in Month

當 `focus` 為 00:00:00 UTC 時，  
要正確的渲染該月份的日期，
且第一天是星期四。

```tsx
describe("if focus on january 1970", () => {
  it("should render days in month correctly", () => {
    const current = new Date(0);
    render(<MonthCalendar.Grid focus={current} />);

    eachDayOfInterval({
      start: current,
      end: endOfMonth(current),
    }).forEach((day) =>
      expect(screen.queryByText(RegExp(format(day, "dd")))).toBeInTheDocument()
    );
  });

  it("first day should thursday", () => {
    render(<MonthCalendar.Grid focus={new Date(0)} />);

    expect(screen.getAllByRole(/(grid)?cell/).at(4))
      //
      .toHaveTextContent("01");
  });

  it("change focus to february 1970, first day should be sunday", () => {
    const first = new Date(0);
    const { rerender } = render(<MonthCalendar.Grid focus={first} />);
    expect(screen.getAllByRole(/(grid)?cell/).at(4))
      //
      .toHaveTextContent("01");

    const second = add(first, { months: 1 });
    rerender(<MonthCalendar.Grid focus={second} />);
    expect(screen.getAllByRole(/(grid)?cell/).at(0))
      //
      .toHaveTextContent("01");
  });
});
```

### Solution

這邊使用 [date-dns] 跟 [ramda] 幫我們處理掉太 low-level 的操作。

```tsx
const getDatesInMonth = (focus: Date) =>
  eachDayOfInterval({
    start: startOfMonth(focus),
    end: endOfMonth(focus),
  });

type GridProps = {
  focus?: Date;
};
const Grid = (props: GridProps) => {
  const focus = props.focus ?? new Date();

  const days = concat(
    repeat(undefined, getDay(startOfMonth(focus))),
    getDatesInMonth(focus)
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
describe("makes the cell focusable, and implement roving tabindex", () => {
  it(`set tabindex="0" on the element that will initially be included in the tab sequence`, () => {
    render(<MonthCalendar.Grid focus={new Date(0)} />);

    expect(
      screen
        .queryAllByRole(/(grid)?cell/)
        .filter((element) => element.getAttribute("tabindex") === "0")
    ).toHaveLength(1);
  });

  it(`set tabindex="-1" on all other focusable elements it contains`, () => {
    render(<MonthCalendar.Grid focus={new Date(0)} />);

    expect(
      screen
        .queryAllByRole(/(grid)?cell/)
        .filter((element) => element.getAttribute("tabindex") === "-1")
    ).toHaveLength(34);
  });
});
```

### Solution

```tsx
const getDatesInMonth = (focus: Date) =>
  eachDayOfInterval({
    start: startOfMonth(focus),
    end: endOfMonth(focus),
  });

type GridProps = {
  focus?: Date;
};
const Grid = (props: GridProps) => {
  const focus = props.focus ?? new Date();

  const days = concat(
    repeat(undefined, getDay(startOfMonth(focus))),
    getDatesInMonth(focus)
  );

  const table = splitEvery(7, days);

  return (
    <table role="grid">
      <tbody>
        {table.map((row, index) => (
          <tr key={index}>
            {row.map((day, index) => (
              <td key={index} tabIndex={day && isSameDay(day, focus) ? 0 : -1}>
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
describe("weekday header", () => {
  it.each([
    ["Su", "Sunday"],
    ["Mo", "Monday"],
    ["Tu", "Tuesday"],
    ["We", "Wednesday"],
    ["Th", "Thursday"],
    ["Fr", "Friday"],
    ["Sa", "Saturday"],
  ])("the day %s in the column headers", (name, abbr) => {
    render(<MonthCalendar.Grid />);

    const el = screen.getByRole("columnheader", { name });
    expect(el).toBeInTheDocument();
    expect(el).toHaveAttribute("abbr", abbr);
  });
});
```

### Solution

```tsx
const getDatesInMonth = (focus: Date) =>
  eachDayOfInterval({
    start: startOfMonth(focus),
    end: endOfMonth(focus),
  });

type GridProps = {
  focus?: Date;
};
const Grid = (props: GridProps) => {
  const focus = props.focus ?? new Date();

  const days = concat(
    repeat(undefined, getDay(startOfMonth(focus))),
    getDatesInMonth(focus)
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
              <td key={index} tabIndex={day && isSameDay(day, focus) ? 0 : -1}>
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
