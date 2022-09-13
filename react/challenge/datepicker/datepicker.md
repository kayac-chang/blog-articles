# 如何製作日期選擇 Date Picker【 我不會寫 React Component 】

hashtags: `#react`, `#datepicker`

## 關於 Date Picker Dialog

[date picker][date-picker] 是一種複合元件，  
包含了 時間輸入欄位 跟 實作了 [對話視窗][dialog] 規格的 [日曆元件][calendar]。

這個元件讓用戶可以選擇從日曆中選擇日期，並帶入到時間輸入欄位。  
如果輸入欄位為空 或是 選擇之日期不合格，則打開日曆時會對焦在當天日期，  
反之，則會對焦在輸入欄位選擇的日期上。

## Spec

時間欄位的輸入格式必須被標記在 `aria-describedby`，讓它可以被輔助科技描述。

## Spec

在選擇日期之後，  
元件按鈕的可達性名稱要從 "Choose Date" 更改為 "Change Date, DATE_STRING" (DATE_STRING 是當前選擇的日期)。  
所以，當對話視窗關閉，焦點返回到按鈕時，輔助科技就會報讀出用戶當前選擇的日期。

## Spec

開啟 對話視窗時，  
必須提供快捷鍵控制改變日曆月份跟年份的按鈕。

## Spec

日曆用來顯示年月的標頭必須標註 live region，  
讓螢幕報讀用戶在用鍵盤或按鈕控制更改年月時，可以得到反饋。

## Spec

鍵盤提示必須顯示在對話視窗下方。  
並標註 live region 用於提醒螢幕報讀用戶焦點已經轉移至日曆的方格。

## Spec

為了提供良好的視覺設計，被標注在欄位標頭的星期通常會被縮寫成兩個字。  
但是這樣會讓螢幕報讀用戶難以理解這個星期的名稱。  
所以透過標注完整的名稱在 `abbr` 屬性內，讓輔助科技用戶可以理解完整的名稱。

## Spec

當按鈕或是日期格接收到 focus 跟 hover 時，必須提供高對比度的邊框樣式，  
用於指出裝置目前正在對焦的目標。

## 名詞對照

| 中文     | 英文        |
| -------- | ----------- |
| 日期選擇 | date picker |
| 對話視窗 | dialog      |

[date-picker]: https://www.w3.org/WAI/ARIA/apg/example-index/dialog-modal/datepicker-dialog
[dialog]: ./dialog/intro.md
[calendar]: ./calendar/month-calendar.md
