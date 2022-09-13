# 如何製作月曆 compound components【 calendar | 我不會寫 React Component 】

hashtags: `#react`, `#calendar`, `#compound components`

本篇接續前篇 [如何製作月曆 integration【 calendar | 我不會寫 React Component 】](./integration.md)  
可以先看完上一篇在接續此篇。

## Goal

接下來我們要設計一種 API 可以給予用戶更大的彈性，  
可以自由的給予元件樣式，行為甚至是子元件。

## 這是一個好的 API 設計嗎？

下面是我們當前的 API 在應用程序中使用的樣子。

```tsx
<Calendar>{(focus) => <MonthCalendar focus={focus} />}</Calendar>
```

試想一下，當我們要添加樣式的時候，  
他會變成：

```tsx
<Calendar
  classes={{
    header: {
      button: "some-button-class",
      title: "some-title-class",
    },
  }}
  buttons={{
    prevYear: () => "<<",
    prevMonth: () => "<",
    nextMonth: () => ">",
    nextYear: () => ">>",
  }}
  title={(focus) => <h2>{format(focus, "MMMM yyyy")}</h2>}
>
  {(focus) => (
    <MonthCalendar
      focus={focus}
      columnheader={(day) => (
        <th abbr={format(day, "EEEE")}>{format(day, "EEEEEE")}</th>
      )}
      gridcell={(day) => (day ? format(day, "dd") : null)}
    />
  )}
</Calendar>
```

Well... 這算 ...  
算是可以解決問題沒錯，我以前也是這樣寫的。

直到我看到了 [這篇關於 IOC 的文章][ok-but-for-real-now]，  
我終於瞭解到這樣寫的問題，

1. 假設需求不斷地增加，那需要的 `props` 就會不斷增加。  
   尤其是作為公用元件庫，需要有能力應對所有的情況，  
   不斷增加 `props` 對於維護元件來說是一件極為痛苦的事，  
   不斷增加或更改 `props` 對於元件開發方或是使用方，  
   都是需要修改，而修改就有機會錯。

2. 這樣的抽象顯然無法體現元件的結構，  
   如果能讓用戶清楚知道元件的結構，  
   並且讓他自己將這些元件組合起來，
   他就可以更有彈性的去調整跟擴充，  
   在尋找問題時也比較容易。

## Compound Components 複合元件

複合元件是 `html` 原生就有的概念，像是：

```html
<select>
  <option value="value1">key1</option>
  <option value="value2">key2</option>
  <option value="value3">key3</option>
</select>
```

兩個不同的 `tag` 組合成一個完整元件，  
當你將它們兩者拆開就沒有作用，也並不合理。

透過移植這個概念，我的設計如下：

```tsx
<Calendar>
  <Calendar.Header>
    <Calendar.Button action="previous year">{"<<"}</Calendar.Button>
    <Calendar.Button action="previous month">{"<"}</Calendar.Button>

    <Calendar.Title />

    <Calendar.Button action="next month">{">"}</Calendar.Button>
    <Calendar.Button action="next year">{">>"}</Calendar.Button>
  </Calendar.Header>

  <MonthCalendar>
    <MonthCalendar.ColumnHeader />

    <MonthCalendar.GridCell />
  </MonthCalendar>
</Calendar>
```

這樣改的好處是：

1. 用戶可以清楚看到完整的結構，以便於他們想要調整或加工某部分的區塊。
2. 用戶可以更自由的安排結構的元件跟樣式。

當然這樣做需要重構我們的程式，  
所幸我們有做好單元測試，  
即便我們大幅改動了很多，  
也可以確保最終的結果合理。

> 其中，我也設計了很多預設值。  
> 預設參數如果能符合大部分使用情境的話，會減少用戶需要耗費的工。

以下會介紹我個人採用過的兩種 Compound Components 用法，  
第一種是比較常見的使用法，
第二種則是我借鏡了 [vue slot][vue-slot] 的變體用法。

## Compound Components - Common UseCase 常見此用情境

首先先將測試調整成我們想要的 Compound Components 形式。

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { add, endOfWeek, format, startOfWeek, sub } from "date-fns";
import { describe, expect, it } from "vitest";
import { Calendar } from "../Calendar";
import { MonthCalendar } from "../MonthCalendar";

describe("<Calendar />", () => {
  describe("calendar should render correctly", () => {
    it("should render button for change previous/next month/year", () => {
      render(
        <Calendar>
          <Calendar.Button action="previous year" />
          <Calendar.Button action="previous month" />
          <Calendar.Button action="next year" />
          <Calendar.Button action="next month" />
        </Calendar>
      );
      expect(screen.getByRole("button", { name: /previous year/ }));
      expect(screen.getByRole("button", { name: /previous month/ }));
      expect(screen.getByRole("button", { name: /next year/ }));
      expect(screen.getByRole("button", { name: /next month/ }));
    });

    it("calendar heading displaying the month and year is marked up as a live region", () => {
      render(
        <Calendar value={new Date(0)}>
          <Calendar.Title />
        </Calendar>
      );
      const element = screen.getByRole("heading");
      expect(element).toHaveTextContent("January 1970");
      expect(element).toHaveAttribute("aria-live", "polite");
    });
  });
});

describe("Integration: Calendar with MonthCalendar", () => {
  const setup = () => {
    userEvent.setup();
    render(
      <Calendar value={new Date(0)}>
        <Calendar.Header>
          <Calendar.Button action="previous year">{"<<"}</Calendar.Button>
          <Calendar.Button action="previous month">{"<"}</Calendar.Button>

          <Calendar.Title />

          <Calendar.Button action="next month">{">"}</Calendar.Button>
          <Calendar.Button action="next year">{">>"}</Calendar.Button>
        </Calendar.Header>

        <MonthCalendar>
          <MonthCalendar.ColumnHeader />

          <MonthCalendar.GridCell />
        </MonthCalendar>
      </Calendar>
    );
  };

  // ... 以下都一樣，略過
});
```

### Solution

Compound Components 可以不用一定要使用 `Context`。  
但 `Context` 可以讓我們在整個元件的範圍下，無視階級傳遞參數，  
作為一種比較彈性的做法而被廣泛採用。

```tsx
// ... 以上都一樣，略過

interface State {
  focus: Date;
  dispatch: Dispatch<Action>;
}
export const Context = createContext<State | null>(null);

function useCalendarContext(error: string) {
  const context = useContext(Context);

  if (!context) {
    throw new Error(error);
  }

  return context;
}

type HeaderProps = {
  children?: ReactNode;
};
function Header(props: HeaderProps) {
  useCalendarContext(
    `<Calendar.Header /> cannot be rendered outside <Calendar />`
  );
  return <header>{props.children}</header>;
}

type ButtonProps = {
  action: Action;
  children?: ReactNode;
};
function Button(props: ButtonProps) {
  const context = useCalendarContext(
    `<Calendar.Button /> cannot be rendered outside <Calendar />`
  );

  const onClick = () => context.dispatch(props.action);

  return (
    <button type="button" aria-label={props.action} onClick={onClick}>
      {props.children}
    </button>
  );
}

type Level = 1 | 2 | 3 | 4 | 5 | 6;
type TitleProps = {
  as?: `h${Level}`;
  children?: ReactNode;
};
function Title(props: TitleProps) {
  const context = useCalendarContext(
    `<Calendar.Title /> cannot be rendered outside <Calendar />`
  );

  const Comp = props.as ?? "h2";
  const children = props.children ?? format(context.focus, "MMMM yyyy");

  return <Comp aria-live="polite">{children}</Comp>;
}

type CalendarProps = {
  value?: Date;
  children?: ReactNode;
  as?: keyof HTMLElementTagNameMap;
};
export function Calendar(props: CalendarProps) {
  const [focus, dispatch] = useReducer(reducer, props.value ?? new Date());

  useEffect(() => {
    const keydown = keymap(dispatch);

    window.addEventListener("keydown", keydown);
    return () => {
      window.removeEventListener("keydown", keydown);
    };
  }, [dispatch]);

  const Comp = props.as ?? "div";

  return (
    <Context.Provider value={{ focus, dispatch }}>
      <Comp>{props.children}</Comp>
    </Context.Provider>
  );
}

Calendar.Header = Header;
Calendar.Button = Button;
Calendar.Title = Title;
```

將函式當作 namespace 一起 export 也是這類型 API 很常見的實作方式，  
但有些人認為這樣的程式碼導入不夠乾淨，會增加額外沒用到的程式碼量，  
我個人是沒有太大意見。

## Compound Components - Slot 變體

```tsx
describe("<MonthCalendar />", () => {
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
      render(
        <MonthCalendar>
          <MonthCalendar.ColumnHeader />
        </MonthCalendar>
      );

      const el = screen.getByRole("columnheader", { name });
      expect(el).toBeInTheDocument();
      expect(el).toHaveAttribute("abbr", abbr);
    });
  });

  describe("Date Grid", () => {
    //
    it("Identifies the table element as a grid widget.", () => {
      render(<MonthCalendar />);

      expect(screen.getByRole("grid")).toBeInTheDocument();
    });

    describe("If focus on January 1970", () => {
      it("Should render days in month correctly", () => {
        const { container } = render(
          <MonthCalendar focus={new Date(0)}>
            <MonthCalendar.GridCell />
          </MonthCalendar>
        );

        eachDayOfInterval({
          start: new Date(0),
          end: endOfMonth(new Date(0)),
        }).forEach((day) =>
          expect(container).toHaveTextContent(RegExp(format(day, "dd")))
        );
      });

      it("the first day should Thursday", () => {
        render(
          <MonthCalendar focus={new Date(0)}>
            <MonthCalendar.GridCell />
          </MonthCalendar>
        );

        expect(screen.getAllByRole(/(grid)?cell/).at(4))
          //
          .toHaveTextContent("01");
      });

      it("If focus on January 1970 first, then change focus to February 1970", () => {
        const first = new Date(0);
        const { rerender } = render(
          <MonthCalendar focus={first}>
            <MonthCalendar.GridCell />
          </MonthCalendar>
        );
        expect(screen.getAllByRole(/(grid)?cell/).at(4))
          //
          .toHaveTextContent("01");

        const second = add(new Date(0), { months: 1 });
        rerender(
          <MonthCalendar focus={second}>
            <MonthCalendar.GridCell />
          </MonthCalendar>
        );
        expect(screen.getAllByRole(/(grid)?cell/).at(0))
          //
          .toHaveTextContent("01");
      });
    });

    describe("Makes the cell focusable, and implement Roving tabindex", () => {
      //
      describe("When the component container is loaded or created", () => {
        it("If focus is January 1970, should be focus on January 1970", () => {
          render(
            <MonthCalendar focus={new Date(0)}>
              <MonthCalendar.GridCell />
            </MonthCalendar>
          );

          expect(document.activeElement)
            //
            .toHaveTextContent("01");
        });

        it("Default focus on today", () => {
          render(
            <MonthCalendar>
              <MonthCalendar.GridCell />
            </MonthCalendar>
          );

          expect(document.activeElement)
            //
            .toHaveTextContent(RegExp(format(new Date(), "dd")));
        });

        it(`Set tabindex="0" on the element that will initially be included in the tab sequence`, () => {
          render(
            <MonthCalendar>
              <MonthCalendar.GridCell />
            </MonthCalendar>
          );

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
    });
  });
});
```

### Solution

```tsx
// ... 以上都一樣，略過

interface State {
  focus: Date;
  table: (Date | undefined)[][];
}

const Context = createContext<State | null>(null);

function useMonthCalendarContext(error: string) {
  const context = useContext(Context);

  if (!context) {
    throw new Error(error);
  }

  return context;
}

type ColumnHeaderProps = {
  children?: (day: Day) => ReactNode;
};
function ColumnHeader(props: ColumnHeaderProps) {
  useMonthCalendarContext(
    `<ColumnHeader /> cannot be rendered outside <MonthCalendar />`
  );

  if (props.children) {
    return <>{(range(0, 7) as Day[]).map(props.children)}</>;
  }

  return (
    <>
      <th abbr="Sunday">Su</th>
      <th abbr="Monday">Mo</th>
      <th abbr="Tuesday">Tu</th>
      <th abbr="Wednesday">We</th>
      <th abbr="Thursday">Th</th>
      <th abbr="Friday">Fr</th>
      <th abbr="Saturday">Sa</th>
    </>
  );
}

type GridCellProps = {
  children?: (date: Date) => ReactNode;
};
function GridCell(props: GridCellProps) {
  const context = useMonthCalendarContext(
    `<GridCell /> cannot be rendered outside <MonthCalendar />`
  );

  const { table, focus: focusOn } = context;

  return (
    <>
      {table.map((row, index) => (
        <tr key={index}>
          {row.map((day, index) => {
            const element = day && props.children?.(day);

            // if child is valid react element, pass focus to the child
            if (isValidElement<{}>(element)) {
              return (
                <td key={index}>
                  {cloneElement(element, {
                    ...element.props,
                    ...focus(Boolean(day && isSameDay(day, focusOn))),
                  })}
                </td>
              );
            }

            return (
              <td
                key={index}
                {...focus(Boolean(day && isSameDay(day, focusOn)))}
              >
                {element || (day && format(day, "dd"))}
              </td>
            );
          })}
        </tr>
      ))}
    </>
  );
}

type MonthCalendarProps = {
  focus?: Date;
  children?: ReactNode;
};
export const MonthCalendar = (props: MonthCalendarProps) => {
  let columnheader: ReturnType<typeof ColumnHeader> | null = null;
  let gridcell: ReturnType<typeof GridCell> | null = null;

  Children.forEach(props.children, (element) => {
    if (!isValidElement(element)) return;

    if (!columnheader && element.type === ColumnHeader) {
      columnheader = element;
    }
    if (!gridcell && element.type === GridCell) {
      gridcell = element;
    }
  });

  const context = useContext(CalendarContext);

  const focus = props.focus ?? context?.focus ?? new Date();

  const days = concat(
    repeat(undefined, getDay(startOfMonth(focus))),
    getDatesInMonth(focus)
  );

  const table = splitEvery(7, days);

  return (
    <Context.Provider value={{ focus, table }}>
      <table role="grid">
        <thead>
          <tr>{columnheader}</tr>
        </thead>
        <tbody>{gridcell}</tbody>
      </table>
    </Context.Provider>
  );
};

MonthCalendar.ColumnHeader = ColumnHeader;
MonthCalendar.GridCell = GridCell;
```

這裡用了一點小技巧將 `props.children` 裡面的 `element` 過濾，  
只留下了我們需要的部分 `ColumnHeader` `GridCell`。

並且這邊有三種提供 `focus` 的方式，  
一種是透過 `props` 拋入，一種是透過 `context`，最後是預設當天，  
並且優先度由左而右，目的也是為了提供用戶更多使用上的便利。

[ok-but-for-real-now]: https://kentcdodds.com/blog/inversion-of-control#ok-but-for-real-now
[vue-slot]: https://vuejs.org/guide/components/slots.html#slot-content-and-outlet
