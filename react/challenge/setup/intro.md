# 導讀【 我不會寫 React Component 】

## Introduction

這個系列會分享我這些年累積下來 React Component 的開發經驗，
也藉此機會嘗試一下我發現的新玩具。

這系列不是走理論派，  
我想嘗試透過實務開發再帶入理論的方式來分享這些知識。

內容會涵蓋：

- Monorepo 的專案架構
- 開發出符合 [WAI][wai] 規格的可達性元件
- 單元測試 跟 E2E 測試
- React Pattern

全部都 **不會很詳細** 的解釋，至少在這個系列我認為不太適合講太多理論。

## 大!? 專案

其實不算是製作大專案，至少我並不崇尚大專案。

但是我們會用 Monorepo 下去拆模組，  
方便元件開發時的獨立性，  
也能順便測試實際專案在導入時的情況，

這也是大多開源元件庫的架構方式。

## accessibility 可達性

製作開源元件庫，是一件非常有趣的事情，  
但元件庫要走向 production 最大的障礙，  
主要出在 [accessibility]。

當前台灣開發生態比較沒有重視，  
甚至根本就不知道這個東西的存在，  
其原因可能是 **沒有打進歐美市場** 跟 **政府立案問題**，  
包含美國，歐洲甚至一些亞洲國家，都有可達性標準相關立法，  
沒有合格是無法在該國營運。

## stability 穩定性

> [The more your tests resemble the way your software is used, the more confidence they can give you.][kenc]  
> Kent C. Dodds

我太常寫出 🐛 了，  
這次會實際操演一遍 [Test-driven development][tdd]，會先寫單元測試在實作。

如果有緣可以在嘗試做 E2E 的文章。

## latest 新的

現在落筆時間是 Sep 2022，  
這個系列描述的技術跟版本，  
至少不會有超過 3 年以上太久遠的部分，

因為很多是在這個時間點算新，  
有些知識跟寫法可能還找不太到中文相關的文章，  
要去翻原文文件跟 repository 的 issue (至少我是這樣)。

## headless component

並不是指完全不處理 style，  
是我傾向 **元件庫應該要只封裝元件邏輯**，  
樣式則是在應用程序開發的階段根據需求套上。

這樣的好處是可以給予設計師最大化的設計彈性，  
而且通常元件邏輯其實大同小異更容易共用。

> 元件邏輯 !== 業務邏輯

現行有蠻多的開源元件庫採用這個模式，  
也是我目前採用過感受最好的方案，  
兼具彈性，效能，可達性，穩定，成本降。

## 如何閱讀這個系列

這個系列主要分做兩個部分

- 標題是 **如何** 開頭就是實作
- 標題是 **什麼** 開頭就是理論

[accessibility]: https://www.w3.org/standards/webdesign/accessibility
[wai]: https://www.w3.org/WAI/
[tdd]: https://en.wikipedia.org/wiki/Test-driven_development
[kenc]: https://twitter.com/kentcdodds/status/977018512689455106?s=20&t=oY1M8L3w8MbIyA1WSPmYyA
