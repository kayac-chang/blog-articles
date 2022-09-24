# 什麼是 Grid 網格【 我不會寫 React Component 】

## 關於這個 Pattern

Grid 是一個容器組件，內部包含許多資訊跟交互元素。  
並可以讓用戶可以透過
<kbd>Arrow</kbd>
<kbd>Home</kbd>
<kbd>End</kbd>
在容器內中移動。

作為一種泛用的容器組件，  
他可以因應各種用途提供較為彈性的鍵盤移動方式。

像是他可以群組化多個 checkboxes，links，  
或是較複雜的像是 spreadsheet 應用程式。

雖然在 WAI-ARIA 屬性中用到了 `row` 跟 `column` 等字眼，  
但使用 `role=grid` 並不會有視覺上的功用，  
他作用是讓輔助科技可以描述這個元件的邏輯架構。

## 與 Table 的不同點

同樣都是表格狀的表現方式，  
可以透過以下因素來選擇要實作 [grid] 或是 [table]。

- [grid] 是組合型組件：
  - 永遠包含複數可聚焦的元素
  - 在頁面的表序列中， [grid]只能有一個可聚焦的元素
  - 需要開發者實作程式來處理元件內的焦點移動
- [table] 的所有可聚焦元素都包含在頁面的表序列中。

## Grid 種類

[grid] 大致可以被歸類成兩種類別，

- 網格狀資料呈現 (date grids)
- 群組化組件，網格狀版型 (layout grids)

雖說上面兩者的 ARIA roles, states, and properties 都是一樣的，  
但根據它們的內容跟用途不同，在鍵盤互動的設計上也會有所不同。

## 網格狀資料呈現 Data Grids For Presenting Tabular Information

[grid] 可以用來呈現表格資料像是 欄位標題，列標題。  
如果表格資料可以被編輯跟操作，它也尤其適合。
也可以提供一些功能，像是內容編輯，選擇，複製貼上剪下。

在 [grid] 裡面，每個欄位會包含一個可聚焦的元素，或是他自身可以聚焦，  
無關乎他們是否可以編輯或是操作，  
這裡有一個例外狀況是：
假如欄位標頭沒有提供像是 排序 或是 過濾 相關的功能時，他們就無需聚焦。

### 鍵盤互動

- <kbd>Right Arrow</kbd>:
  移動到右邊一格的格子。如果已經在最右邊，焦點就不用動。
- <kbd>Left Arrow</kbd>:
  移動到左邊一格的格子。如果已經在最左邊，焦點就不用動。
- <kbd>Down Arrow</kdb>:
  移動到下方一格的格子。如果已經在最下面，焦點就不用動。
- <kbd>Up Arrow</kbd>:
  移動到上方一格的格子。如果已經在最上面，焦點就不用動。
- <kbd>Page Down</kdb>:
  移動到下面的格子，具體行數由開發者定義。如果已經在最下面，焦點就不用動。
- <kbd>Page Up</kbd>:
  移動到上面的格子，具體行數由開發者定義。如果已經在最上面，焦點就不用動。
- <kbd>Home</kbd>:
  移動到當前這行的第一個格子。
- <kbd>End</kbd>:
  移動到當前這行的最後一個格子。
- <kbd>Control + Home</kbd>:
  移動到第一行第一格。
- <kbd>Control + End</kbd>:
  移動到最後一行最後一格。

> 上述的焦點移動，會依照內容來決定焦點要對焦在 格子內的元素 還是 格子本身。

如果 [grid] 支援 `cells`, `rows`, `columns`，  
以下也是常見的鍵盤互動。

- <kbd>Control + Space</kbd>:
  選擇當前對焦的那格。
- <kbd>Shift + Space</kbd>:
  選擇當前對焦那行。
  假如 [grid] 包含 checkboxes 且當前焦點不在 checkbox 上，
  這個動作會將 checkbox 改成選取。
- <kbd>Control + A</kbd>:
  選擇所有格子。
- <kbd>Shift + Right Arrow</kbd>:
  選擇當前格右邊的所有格子。
- <kbd>Shift + Left Arrow</kbd>:
  選擇當前格左邊的所有格子。
- <kbd>Shift + Down Arrow</kbd>:
  選擇當前格下面的所有格子。
- <kbd>Shift + Up Arrow</kbd>:
  選擇當前格上面的所有格子。

## 網格狀版型 Layout Grids for Grouping Widgets

[grid] 可以當做版型，用來群組化某些交互元素，像是 links, button, checkbox 等。  
因為整個 [grid] 只會有一個元素被包含在表序列之中，  
將元素透過 [grid] 群組化可以減少用戶需要按下的 <kbd>tab</kbd> 次數。

尤其是在元件會動態加載更多元素的情況，像是購物網站某個元件往下滑時會持續推薦新的產品，這個實作尤其有用。

不同於網格狀資料呈現，將 [grid] 當作版型時，沒有一定要加上 `header cells` 作為標頭，
且可能會出現只有一行或是一個格子的情況。

### 鍵盤互動

- <kbd>Right Arrow</kbd>:
  移動到右邊一格的格子。
  非必要的，如果當前對焦在該行最右邊的格子，動作後可以移動到下一行的第一個。
  如果焦點對焦在最後一格，焦點則不移動。
- <kbd>Left Arrow</kbd>:
  移動到左邊一格的格子。
  非必要的，如果當前對焦在該行最左邊的格子，動作後可以移動到上一行的最後一個。
  如果焦點對焦在第一格，焦點則不移動。
- <kbd>Down Arrow</kbd>:
  移動到下面一格的格子。
  非必要的，如果當前對焦在這頁的最後一行的格子，動作後可以移動到下一頁的第一行。
  如果焦點對焦在最後一格，焦點則不移動。
- <kbd>Up Arrow</kbd>:
  移動到上面一格的格子。
  非必要的，如果當前對焦在這頁的第一行的格子，動作後可以移動到上一頁的最後一行。
  如果焦點對焦在第一格，焦點則不移動。
- <kbd>Page Down (Optional)</kbd>:
  移動到下面的格子，具體行數由開發者定義。如果已經在最下面，焦點就不用動。
- <kbd>Page Up (Optional)<kbd>:
  移動到上面的格子，具體行數由開發者定義。如果已經在最上面，焦點就不用動。
- <kbd>Home</kbd>:
  移動到當前這行的第一個格子。
- <kbd>End</kbd>:
  移動到當前這行的最後一個格子。
- <kbd>Control + Home (optional)</kbd>:
  移動到第一行第一格。
- <kbd>Control + End (Optional)</kbd>:
  移動到最後一行最後一格。

> 上述的焦點移動，會依照內容來決定焦點要對焦在 格子內的元素 還是 格子本身。

通常網格狀版型不會提供格子選擇的功能。但如果真的需要，常見的鍵盤操作如下：

- <kbd>Control + Space</kbd>:
  選擇當前對焦的那格。
- <kbd>Shift + Space</kbd>:
  選擇當前對焦那行。
  假如 [grid] 包含 checkboxes 且當前焦點不在 checkbox 上，
  這個動作會將 checkbox 改成選取。
- <kbd>Control + A</kbd>:
  選擇所有格子。
- <kbd>Shift + Right Arrow</kbd>:
  選擇當前格右邊的所有格子。
- <kbd>Shift + Left Arrow</kbd>:
  選擇當前格左邊的所有格子。
- <kbd>Shift + Down Arrow</kbd>:
  選擇當前格下面的所有格子。
- <kbd>Shift + Up Arrow</kbd>:
  選擇當前格上面的所有格子。

## 焦點要對焦在 格子內的元素 還是 格子本身

對使用輔助科技的用戶來說，
在使用 [grid] 的體驗品質很大程度被 格子的內容 跟 鍵盤對焦到哪 影響。

例如，假如欄位包含了按鈕，但在導航時對焦的對象卻是格子而不是按鈕，  
螢幕報讀器閱讀出按鈕的文字內容卻無法通知用戶這個是個按鈕。

這邊有兩種理想情況：

- 格子內容包含的是一個組件，且該組件本身不會用到 <kbd>Arrow Key</kbd>，
  則將焦點對焦在該組件上。
- 格子內容包含文字跟圖片，則焦點對焦在格子上。

## 關聯閱讀

[grid][grid]

[Grids Part 1: To grid or not to grid](https://sarahmhigley.com/writing/grids-part1/)

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
