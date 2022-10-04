# 如何製作警示 alert【 alert | 我不會寫 React Component 】

## About

警示元素，主要用來展示明確跟重要的訊息，  
並要吸引用戶的注意力而不打斷用戶當前正在進行的工作。

動態渲染警示，會自動被螢幕報讀閱讀，  
在部分處理系統還會觸發警示音。

注意在目前，螢幕報讀不會知會用戶，在頁面載入完畢前的警示。

因為警示會在盡可能不打斷用戶的情況下，  
試圖提供重要且即時的資訊，  
注意不要讓他們影響到鍵盤焦點。

其中一個注意點是，避免讓警示自動消失，  
警示消失得太快可能會導致螢幕報讀的錯誤。

另一個注意點是，頻繁警示的造成不斷打斷用戶，  
不斷地干涉用戶會阻礙可用性，尤其對於視覺跟注意力障礙的用戶。

## Spec: role="alert"

警示元素需要帶有 `role="alert"`。

```tsx
describe("role, property, state, and tabindex attributes", () => {
  it("identifies the element as the container where alert content will be added or updated", () => {
    render(<Alert>Hello</Alert>);
    expect(screen.queryByRole("alert")).toBeInTheDocument();
  });
});
```

### Solution

```tsx
export function Alert(props: PCP<"div", {}>) {
  return <div {...props} role="alert" />;
}
```

然後實作就結束了。
以下說明 `role='alert'` 的額外效果。

## aria-live="assertive"

帶有 `role=alert` 的元素，會隱含這個屬性，  
用於告知輔助科技，立刻插播一條訊息給用戶。

## aria-atomic="true"

帶有 `role=alert` 的元素，會隱含這個屬性，  
用於告知輔助科技，整個元素作為一條完整內容告訴用戶。
