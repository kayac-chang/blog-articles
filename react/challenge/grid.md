# 什麼是 Grid【 我不會寫 React Component 】

## 關於這個 Pattern

Grid 是一個容器組件，內部包含許多資訊跟交互元素。  
並可以讓用戶可以透過
<kbd>Arrow</kbd>
<kbd>Home</kbd>
<kbd>End</kbd>
在容器內中移動。

作為一種泛用型的容器組件，  
他提供了彈性化的鍵盤移動方式，  
可用來提供多種用途。

像是他可以群組化多個 checkboxes，links，  
或是較複雜的像是 spreadsheet 應用程式。

雖然在 WAI-ARIA 屬性中用到了 "row" 跟 "column" 等字眼，  
但使用 grid role 並不會有視覺上的功用，  
他作用是讓輔助科技可以描述跟展現這個元件的邏輯架構。

### 與 Table 的不同點

同樣都是表格狀的表現方式，  
可以透過以下因素來選擇要實作 [grid] 或是 [table]。

- [grid] 是組合型組件：
  - 永遠包含複數可聚焦的元素
  - 在頁面的表序列中， [grid]只能有一個可聚焦的元素
  - 需要開發者實作程式來處理元件內的焦點移動
- [table] 的所有可聚焦元素都包含在頁面的表序列中。

### Grid 種類

[grid] pattern 可以被歸類成兩種類別，

## 名詞對照

| 中文     | 英文                   |
| -------- | ---------------------- |
| 表序列   | tab sequence           |
| 元素     | element                |
| 輔助科技 | assistive technologies |
| 表格狀   | tabular                |
| 組合型   | composite              |
| 組件     | widget                 |
| 可聚焦   | focusable              |

[grid]: https://w3c.github.io/aria/#grid
[table]: https://www.w3.org/WAI/ARIA/apg/patterns/table/
