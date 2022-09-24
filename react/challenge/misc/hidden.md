## 如何隱藏元素 【 我不會寫 React Component 】

這邊介紹幾個方式，可以讓 _accessibility tree_ 忽略指定的元素，  
像是以下情況：

- 單純裝飾用，沒有實際意義的 icons 或是 圖片。
- 重複的內容，像是重複文字。
- 不在畫面上，或是收起的內容，像是 menu。

## aria-hidden

標記這個屬性可以讓可達性 API 忽略這個元素，而不會影響到畫面。

**這個標籤不應該用在能夠聚焦的元素上**，  
此外，這個屬性會影響到元素的所有子節點，  
所以子節點需要聚焦的話，也不應該用這個屬性。

注意，標記他不會影響到畫面，所以元素可能依舊會被渲染。

請警慎的使用這個標籤，因為他不會影響到畫面，  
除非拿掉該元素對整個頁面要表達的內容完全不影響，我們才會考慮使用它。

此外，`aria-hidden="true"` 跟 `role="presentation"` 還有 `role="none"` 看似很相近，  
但用途不同。

- `aria-hidden="true"` 會把元素跟所有子節點全部從 _accessibility tree_ 上除去。
- `role="presentation"` 跟 `role="none"` 會移除該元素的語意，
  但依然會在 _accessibility tree_ 上，且輔助科技還是可以讀到它的內容。

### 範例

以下範例使用，[font-awesome v6][fontawesome] 跟 [bootstrap v5][bootstrap]

```html
<button>
  <i class="fa-brands fa-twitter"></i>
  <span class="label"> Tweet </span>
</button>
```

變成

```
button "[]Tweet" focusable: true
    StaticText "[]"
    StaticText "Tweet"
```

標記成

```html
<button>
  <i class="fa-brands fa-twitter" aria-hidden></i>
  <span class="label"> Tweet </span>
</button>
```

會變成

```
button "Tweet" focusable: true
    StaticText "Tweet"
```

## HTML - hidden

標記 HTML 的 `hidden` 屬性會告訴瀏覽器這個元素不渲染。

**注意，不要因為不會渲染就把敏感資訊丟上去，注意資安。**

被標記 `hidden` 的元素必須被隱藏無論任何呈現方式，包含螢幕報讀。

被隱藏的元素依然會發揮它的作用，  
像是 `script` 元素依然會執行腳本，`form` 元素依然會 `submit`。

但不應該被依然看得到的元素關聯，像是，`a` 的 `href` 連到這個元素，  
畢竟內容已經被標注隱藏，沒理由連到這個元素。

## CSS - display:none / visibility:hidden

通常是用 元素是否渲染到畫面上 來決定那個元素是否需要被忽略，  
常見的方式像是，`display:none` 或 `visibility:hidden`。

它會作用整個元素包含子節點。

## role - presentation / none

`role=presentation` 跟 `role=none` 是同義詞。  
目的都是要移除該元素在 ARIA 的語意，  
原因是有些元素原本就會有他隱含的語意，像是 `article` 或是 `input` 之類。

例如寫：

```html
<h2 role="presentation">Democracy Dies in Darkness</h2>
```

就跟寫

```html
<div>Democracy Dies in Darkness</div>
```

一樣。

有些元素屬於複合元素像是 `ul`, `ol` 被標注 `role=presentation`，  
會影響到底下有關連的子元素也一起被拿掉語意。

像是

```html
<ul role="presentation">
  <li>
    <a href="#">Link 1</a>
  </li>
  <li>
    <a href="#">Link 2</a>
  </li>
  <li>
    <a href="#">Link 3</a>
  </li>
</ul>
```

會變成

```
StaticText "*"
link "Link 1" focusable: true
    StaticText "Link 1"
StaticText "*"
link "Link 2" focusable: true
    StaticText "Link 2"
StaticText "*"
link "Link 3" focusable: true
    StaticText "Link 3"
```

## sr-only

如果只想要視覺上隱藏元素的話，可以用以下方式：

```css
.sr-only {
  border: 0;
  clip: rect(0 0 0 0);
  height: 1px;
  margin: -1px;
  overflow: hidden;
  padding: 0;
  position: absolute;
  white-space: nowrap;
  width: 1px;
}
```

這個很常被使用在幾類情況像是：

### 隱藏欄位標籤

`form` 輸入欄位一定要有 `label`，  
但畫面視覺設計上可能不想顯示這個標籤，  
我們可以用 `sr-only` 進行隱藏。

```html
<form>
  <label class="sr-only" for="search">Search criteria</label>
  <input type="text" id="search" name="search" value="" />
  <input type="submit" value="Search" />
</form>
```

[fontawesome]: https://fontawesome.com/
[bootstrap]: https://getbootstrap.com/
