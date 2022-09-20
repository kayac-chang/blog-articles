# 如何製作日期選擇 Date Picker 4【 我不會寫 React Component 】

hashtags: `#react`, `#components`, `#accessibility`, `#datepicker`

本篇接續前篇 [如何製作日期選擇 Date Picker 3【 我不會寫 React Component 】](./datepicker-3.md)  
可以先看完上一篇在接續此篇。

## Spec: Roving tabindex Navigation

我們在 [如何製作月曆 integration【 calendar | 我不會寫 React Component 】](./calendar/integration.md) 實作了 Roving tabindex Navigation，  
這邊就不用在實作一遍，以下提供測試。

```tsx
it("only one button in the calendar grid is in the tab sequence", async () => {
  setup(new Date(0));
  await user.click(screen.getByRole("button"));
  expect(
    Array.from(document.querySelectorAll("table button[tabindex]")).filter(
      (button) => Number(button.getAttribute("tabindex")) >= 0
    ).length
  ).toEqual(1);
});
```

## Spec: Focus Trap

因為我們在 [如何製作對話視窗 interaction【 dialog | 我不會寫 React Component 】](./dialog/interaction.md) 實作過 Focus Trap，  
所以這邊就不用在實作一遍，以下提供測試。

```tsx
describe("tab", () => {
  it("moves focus to next element in the dialog tab sequence", async () => {
    setup(new Date(0));
    await user.click(screen.getByRole("button"));
    expect(screen.getByText("01")).toHaveFocus();
    await user.keyboard("{Tab}");
    expect(screen.getByLabelText("previous month")).toHaveFocus();
    await user.keyboard("{Tab}");
    expect(screen.getByLabelText("next month")).toHaveFocus();
  });

  it("if focus is on the last element, moves focus to the first element", async () => {
    setup(new Date(0));
    await user.click(screen.getByRole("button"));
    expect(screen.getByText("01")).toHaveFocus();
    await user.keyboard("{Tab}");
    expect(screen.getByLabelText("previous month")).toHaveFocus();
    await user.keyboard("{Tab}");
    expect(screen.getByLabelText("next month")).toHaveFocus();
    await user.keyboard("{Tab}");
    expect(screen.getByLabelText("previous year")).toHaveFocus();
    await user.keyboard("{Tab}");
    expect(screen.getByLabelText("next year")).toHaveFocus();
    await user.keyboard("{Tab}");
    expect(screen.getByText("01")).toHaveFocus();
  });
});

describe("shift + tab", () => {
  it("moves focus to previous element in the dialog tab sequence.", async () => {
    setup(new Date(0));
    await user.click(screen.getByRole("button"));
    expect(screen.getByText("01")).toHaveFocus();
    await user.keyboard("{Shift>}{Tab}{/Shift}");
    expect(screen.getByLabelText("next year")).toHaveFocus();
    await user.keyboard("{Shift>}{Tab}{/Shift}");
    expect(screen.getByLabelText("previous year")).toHaveFocus();
  });

  it("if focus is on the first element, moves focus to the last element", async () => {
    setup(new Date(0));
    await user.click(screen.getByRole("button"));
    expect(screen.getByText("01")).toHaveFocus();
    await user.keyboard("{Shift>}{Tab}{/Shift}");
    expect(screen.getByLabelText("next year")).toHaveFocus();
    await user.keyboard("{Shift>}{Tab}{/Shift}");
    expect(screen.getByLabelText("previous year")).toHaveFocus();
    await user.keyboard("{Shift>}{Tab}{/Shift}");
    expect(screen.getByLabelText("next month")).toHaveFocus();
    await user.keyboard("{Shift>}{Tab}{/Shift}");
    expect(screen.getByLabelText("previous month")).toHaveFocus();
    await user.keyboard("{Shift>}{Tab}{/Shift}");
    expect(screen.getByText("01")).toHaveFocus();
  });
});
```

## Spec: Control Month/Year Button

這邊有個不容易被注意到的 bug，  
寫單元測試可以在早期階段就抓出這些不容易被注意到的問題。

```tsx
describe("date picker dialog: month/year buttons", () => {
  describe("space, enter", () => {
    it("change the month and/or year displayed in the calendar grid", async () => {
      setup(new Date(0));
      await user.click(screen.getByRole("button"));

      await user.keyboard("{Tab}");
      expect(screen.getByLabelText("previous month")).toHaveFocus();
      await user.keyboard("{Space}");
      expect(screen.getByRole("grid")).toHaveAccessibleName("December 1969");

      await user.keyboard("{Tab}");
      expect(screen.getByLabelText("next month")).toHaveFocus();
      await user.keyboard("{Space}");
      expect(screen.getByRole("grid")).toHaveAccessibleName("January 1970");

      await user.keyboard("{Tab}");
      expect(screen.getByLabelText("previous year")).toHaveFocus();
      await user.keyboard("{Space}");
      expect(screen.getByRole("grid")).toHaveAccessibleName("January 1969");

      await user.keyboard("{Tab}");
      expect(screen.getByLabelText("next year")).toHaveFocus();
      await user.keyboard("{Space}");
      expect(screen.getByRole("grid")).toHaveAccessibleName("January 1970");
    });
  });
});
```

### Solution

注意到 `TestCalendar` 這邊，我們拋入了 `as={Dialog}` 來組合這兩個元件。

```tsx
  function TestCalendar() {
    //...

    return (
      <Calendar
        as={Dialog}
      >
```

因為 `Calendar` 內部有用於追蹤對焦日期的狀態 `focus`，  
當用戶按下切換月份或年份時會處發 `rerender`。

```tsx
export function Calendar() {
// ...
const [focus, dispatch] = useReducer(reducer, value ?? new Date());
```

因為 `as={Dialog}`，`Dialog` 被用作這個元件的 `children`。

```tsx
const Comp = as ?? "div";

//...

return (
  <Context.Provider value={context}>
    <Comp {...rest} />
  </Context.Provider>
);
```

`Calendar` `rerender` 也影響到了 `Dialog` `rerender`，  
導致 `Dialog` 內部的 `useEffect` 重新被執行。

```tsx
  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const tabbables = tabbable(element, {
      displayCheck: IS_TEST_ENV,
    }) as HTMLElement[];

    focus(initialFocusRef?.current ?? tabbables.at(0));
```

因為上面的 `focus` 邏輯，  
每次重新渲染會改變焦點到 `initialFocusRef`，  
這不是我們希望的。

```tsx
if (!element.contains(document.activeElement)) {
  focus(initialFocusRef?.current ?? tabbables.at(0));
}
```

透過上面的邏輯，確認當前焦點是否已經對焦在元件內，如果沒有才去執行對焦。  
(暫時我只想得到這個解法，如果有其他解法歡迎在下方留言討論)。

## 名詞對照

| 中文     | 英文        |
| -------- | ----------- |
| 日期選擇 | date picker |
| 對話視窗 | dialog      |
