# 什麼是 Accessibility Landmark 【 我不會寫 React Component 】

> 如果你買了一個前端課程，裡面的老師連 semantic html 都不會用，建議你趕快退錢換家。

## 簡介

無障礙 landmark 用來標記頁面上某個段落的情境語意，  
讓用戶可以透過輔助科技導航到他們想去的段落。

## 原生的 HTML 標籤

部分 HTML 的用來標記段落的元素會自動建立 ARIA landmark。
正確的使用語意標籤會給予輔助科技用戶更多資訊。

| HTML Element | 預設的 landmark role |
| ------------ | -------------------- |
| aside        | complementary 補充   |
| footer       | contentinfo 內容資訊 |
| header       | banner 橫幅          |
| main         | main 主題            |
| nav          | navigation 導航      |
| section      | region 區塊          |

## 概念

頁面上所有需要被認知的內容都必須被包含進 landmark，  
並且每個 landmark 應該要符合其情境，  
這是最有效提供輔助科技用戶需要的資訊的方式。

> 簡單來說：  
> 光是把 semantic html 寫對，這個網站的品質就好非常多了。

Step 1: 定義邏輯化架構

通常設計師會透過排版跟空間，將頁面拆分成數個區塊。  
並根據需要定義那個區塊主要負責的邏輯。

Step 2: 標記該區塊的 landmark

根據該區塊的類型標記 landmark。  
部分 landmark 在第一層級必須有，像是 `banner`，`main`，`complementary`，`contentinfo`。  
landmark 可以巢狀定義，也就是說可以有父子層的關係。

Step 3: Label areas

If a specific landmark role is used more than once on a page, provide each instance of that landmark with a unique label. There is one rare circumstance where providing the same label to multiple instances of a landmark can be beneficial: the content and purpose of each instance is identical. For example, a large search results table has two sets of identical pagination controls -- one above and one below the table, so each set is in a navigation region labelled Search Results. In this case, adding extra information to the label that distinguishes the two instances may be more distracting than helpful.
If a landmark is only used once on the page it may not require a label. See Landmark Roles section below.
If an area begins with a heading element (e.g. h1-h6) it can be used as the label for the area using the aria-labelledby attribute.
If an area requires a label and does not have a heading element, provide a label using the aria-label attribute.
Do not use the landmark role as part of the label. For example, a navigation landmark with a label "Site Navigation" will be announced by a screen reader as "Site Navigation Navigation". The label should simply be "Site".

[landmark-regions]: https://www.w3.org/WAI/ARIA/apg/practices/landmark-regions/
