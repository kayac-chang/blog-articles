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
部分 landmark 在第一層級必須有，像是 **banner**，**main**，**complementary**，**contentinfo**。  
landmark 可以巢狀，也就是說可以定義父子層。

Step 3: 區塊標籤

- 如果在同一頁面中，特定的 landmark 出現超過一次，就要給予那個 landmark 唯一的標籤。
- 如果只出現一次就不用特別標注標籤。
- 如果該區塊有標頭元素 (就是 `h1`-`h6`)，可以標注 [aria-labelledby] 作為標籤。
- 如果該區塊沒有標頭元素，則標注 [aria-label] 標籤。
- 不要用 landmark role 作為標籤的內文，  
  例如，導航列的 landmark 如果標記成 "Site Navigation"，  
  螢幕報讀就會唸成 "Site Navigation Navigation"，  
  這邊應該簡單標成 "Site"。

## Landmark Roles

### Banner 旗標

**Banner** 通常作為跟 整個網站有關的內容，並且會在每個頁面的開頭。  
整個網站的有關內容像是 `logo`，`sponsor` 或是跟當前網站有關的搜尋工具。

- 每個頁面可能會有一個 **banner**。
- **banner** 必須是 第一階層 landmark。
- 當頁面包含巢狀 **document** 或是 **application** role 的時候
  (通常出現在用到 `iframe` 或是 `frame` 元素)，  
  每個 **document** 或是 **application** 可能會有一個 **banner**。
- 如果頁面超過一個 **banner**，則都必須標注唯一的標籤。

#### HTML Techniques

HTML `header` 標籤會有隱含的 **banner** role，但必須要直系於 `body` 底下。  
如果在 `article`，`aside`，`main`，`nav`，`section` 底下則沒有預設隱含的 role。

### Complementary 補充

**complementary** 是設計來補充主要內容的段落，跟主要內文屬於同樣層級，  
但內容跟意義會跟主要內容有所區別。

- **complementary** 必須是 第一階層 landmark。
- 如果補充內容跟主要內文完全無關時，應該改用更一般的 role **region**。
- 如果頁面超過一個 **complementary**，則都必須標注唯一的標籤。

#### HTML Techniques

使用 HTML `aside` 標籤會隱含 `complementary`。

### Contentinfo 內容資訊

**contentinfo** 會在頁面的最下方，標記一些常見的資訊，通常被稱作頁面的 **footer**，  
其中包含像是 copyrights， privacy 或是 accessibility 的聲明。

- 每個頁面可能會有一個 **contentinfo**。
- **contentinfo** 必須是 第一階層 landmark。
- 當頁面包含巢狀 **document** 或是 **application** role 的時候
  (通常出現在用到 `iframe` 或是 `frame` 元素)，  
  每個 **document** 或是 **application** 可能會有一個 **contentinfo**。
- 如果頁面超過一個 **contentinfo**，則都必須標注唯一的標籤。

#### HTML Techniques

HTML `footer` 標籤會有隱含的 **contentinfo** role，但必須要直系於 `body` 底下。  
如果在 `article`，`aside`，`main`，`nav`，`section` 底下則沒有預設隱含的 role。

### Form 表單

**form** 標示某個區塊內的物件會構成一個表單。

- 如果主要是用作搜尋功能，使用 **search** role 替代。
- **form** 必須要有標籤幫助用戶了解這個表單的用途。
- 表單的標籤必須讓所有用戶都能看見 (就是 `h1`-`h6`)。
- 如果頁面超過一個 **form**，則都必須標注唯一的標籤。
- 盡可能使用原生的元素，像是 `button`，`input`，`select`，`textarea` 等，  
  用來提供原生的情境語意。

#### HTML Techniques

使用 HTML `form` 標籤且設有可達性名稱 (就是 [aria-labelledby]，[aria-label] 或是 [title]) 就會隱含 `form` landmark。

### Main 主要

**Main** 用來標示該頁的主要內容。

- 每個頁面可能會有一個 **main**。
- **main** 必須是 第一階層 landmark。
- 當頁面包含巢狀 **document** 或是 **application** role 的時候
  (通常出現在用到 `iframe` 或是 `frame` 元素)，  
  每個 **document** 或是 **application** 可能會有一個 **main**。
- 如果頁面超過一個 **main**，則都必須標注唯一的標籤。

#### HTML Techniques

使用 HTML `main` 標籤會隱含 `main`。

### Navigation 導航

Navigation landmarks provide a way to identify groups (e.g. lists) of links that are intended to be used for website or page content navigation.

**Navigation** 用來整合這個網站或是頁面用到的連結。

- 如果頁面超過一個 **navigation**，則都必須標注唯一的標籤。
- 如果兩個 **navigation** 裡面的連結都一樣，應該要標記一樣的標籤。

#### HTML Techniques

使用 HTML `nav` 標籤會隱含 `navigation`。

### Region 區塊

**Region** 標記頁面上某個區塊對於用戶足夠重要，重要到需要提供導航到這個段落。

- **region** 需要標記標籤。
- 如果頁面超過一個 **region**，則都必須標注唯一的標籤。
- 當內容沒有辦法標記成適當的 landmark 時，可以使用 **region**。

#### HTML Techniques

使用 HTML `section` 標籤且設有可達性名稱 (就是 [aria-labelledby]，[aria-label] 或是 [title]) 就會隱含 `region` landmark。

### Search 搜尋

**Search** 標示某個區塊內的物件會構成一個搜尋。

- 如果主要是用作搜尋功能，使用 **search** role 替代。
- 如果頁面超過一個 **search**，則都必須標注唯一的標籤。

[landmark-regions]: https://www.w3.org/WAI/ARIA/apg/practices/landmark-regions/
[aria-labelledby]: https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-labelledby
[aria-label]: https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-label
[title]: https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/title
