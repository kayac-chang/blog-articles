# Combobox

## About 簡述

[Combobox][combobox] 是指一個 [input] 元件搭配一組 `popup` 元件，  
`popup` 上提供可能的選項，讓用戶從中選擇需要的選項並帶回至 [input]。

## Scenario 適用情境

以下兩種情境適合透過 [combobox] 獲取用戶輸入。

### Option, Filter

數值必須符合允許填入的選項。

> **例如**  
> **地區欄位** 必須符合正確的地區名稱。

> **注意**  
> [listbox] 跟 [menubutton] 同樣適用於這個情境，其中差異會在後面詳述。

> **範例**  
> [react-spectrum]  
> [headlessui]

### Suggestion

允許輸入任意數值，而元件目標是提供可能的選項供用戶參考，

> **例如**  
> **搜尋欄位** 會提供建議的關鍵字 或是 提供用戶前一次的搜尋關鍵字，以節省用戶時間。

> **範例**  
> [google]

## Autocomplete

在 _popup_ 呈現可能的數值，這個行為被稱作 _autocomplete_。  
[combobox] 可以有以下 4 種形式的 _autocomplete_：

### No autocomplete 沒有

[combobox] 是 _editable_，且 _popup_ 展開時，  
其建議選項不會因為用戶輸入而更動。

> **例如**  
> _popup_ 顯示的是 最近被輸入的數值，此類建議選項不會因為用戶的當前輸入而改變。

> **範例**  
> [Editable Combobox Without Autocomplete][combobox-autocomplete-none]

### List autocomplete with manual selection 手動選擇

當 _popup_ 展開並提供建議選項，且 [combobox] 是 _editable_，
建議選項會根據用戶輸入的的字段更動，
用戶必須選擇其中選項帶入該數值，否則保留用戶當前輸入。

> **範例**  
> [Editable Combobox with List Autocomplete][combobox-autocomplete-list]

### List autocomplete with automatic selection 自動選擇

當 _popup_ 展開並提供建議選項，且 [combobox] 是 _editable_，
建議選項會根據用戶輸入的的字段更動，

用戶輸入時，第一個選項會被高亮以作為當前選項，
除非用戶特別選擇某個選項作為數值，
否則當 [combobox] _blur_ 時，會自動帶入被高亮的選項。

> **範例**  
> [Editable Combobox with List Autocomplete][combobox-autocomplete-both]

### List with inline autocomplete

大致與前者一樣，但附加了額外的功能。
建議選項的字段會自動帶入用戶當前的輸入欄位，
被自動填上的字段會被高亮，且建議選項會變成已選狀態。

> **範例**  
> [Editable Combobox with List Autocomplete][combobox-autocomplete-both]

## Implementations 實作

### Presentation 呈現

_Popup_ 可以用 [listbox], [grid], [tree] 或是 [dialog] 呈現。

> **範例**  
> [Editable Combobox with Grid Popup][grid-combo]  
> [Date Picker Combobox][combobox-datepicker]

### Extra 額外

可以包涵額外的 _Open Button_ ，用於開啟關閉 _Popup_。

> **範例**  
> [headlessui]

### Behaviors 行為

部分 [combobox] 允許用戶自行輸入任一數值。

#### 不支援 text input

此類被視為 _select-only_，用戶只能透過選擇帶入。  
在部分 _Browser_ ，當 `select` 元件上有 `size="1"` 時，輔助科技會將其視為 _combobox_。

> **範例**  
> [Select-Only Combobox]

#### 支援 text input

此類被視為 _editable_，分作以下兩類。

- 允許用戶輸入任一數值。
- 限制用戶只能選擇數值，此類 [input] 被視為 _Filter_。

#### Popup

預設的狀態為 _collapsed 收起_。  
根據需求，每種類型實作會有不同的展開邏輯設計，可能的邏輯設計範例如下：

- 當按下 <kbd>Down Arrow</kbd> 或是 按下 _open_ 按鈕時會展開。
- 如果 [combobox] 是 _editable_ 且 **輸入的字串並沒有符合任何合法數值時**，就不會展開。
- 如果當前用戶 _focus_ [combobox] 時，即便 **沒有任何輸入字串** 都會展開。
- 如果 [combobox] 是 _editable_ 且 **輸入的字串長度要大於某個數字**，且 **符合建議搜尋的部分字段** 才會展開。

當 [combobox] 為 _editable_ 且具任意形式的 _autocomplete_，  
_popup_ 可能會根據用戶輸入出現或是消失，

> **例如**  
> 用戶輸入 2 個字時出現了 5 個建議選項，  
> 但當輸入第 3 個字時沒有任何選項符合匹配，  
> 此時，_popup_ 可能會關閉，若有 _inline completion_ 則會消失。

## 與 [listbox], [menubutton] 的差異

有兩個視覺上相近的元件分別是 [listbox] 跟 [menubutton]，  
且都具備讓用戶在眾多選項中做出單一選擇的目的。

其中一個可用於區分 [combobox] 的特色是，  
用戶的選擇 可以被帶入至 一個可以自由編輯的輸入欄位，  
這讓用戶能夠可以複製部分或全部的選項。

[combobox] 跟 [menubutton] 都可以辦到的功能是，用戶不會遺失它前一次的選項。  
當用戶自由航行於 [combobox] 中的 選項 或是 清單，  
當按下 <kbd>Escape</kbd> 時，會關閉 _popup_ 或是 _menu_ 但不會遺失之前的輸入。  
相較之下，[listbox] 在切換選項時會立刻改變其數值，  
且 <kbd>Escape</kbd> 並沒有返回上次數值的功能。

[combobox] 跟 [listbox] 可以透過 `aria-required="true"` 標記為 _required 必填_，  
他們都具有 [accessible name 易達性名稱][what-is-an-accessible-name] 用於區分它們的數值，  
所以使用輔助技術的用戶當前之 focus，無論是在 [combobox] 或是 [listbox]，  
都可以觀測到相對應的元件名稱跟當前數值。  
但是 [menubutton] 無法被標註為 _required 必填_，  
雖然其具有 [易達性名稱][what-is-an-accessible-name] 但並不具備數值。

## Keyboard Interaction 鍵盤互動 (測試項目)

- [combobox] 包含在頁面的 [<kbd>Tab</kbd> sequence][tabindex] 中
- 當有 _popup_ 觸發按鈕時，<kbd>Tab</kbd> 必須跳過 _popup_ 觸發按鈕

### combobox 元件的鍵盤互動

當 _focus_ 在 [combobox] 時：

- <kbd>Down Arrow</kbd>：
  轉移 _focus_ 至 _popup_，

  - 若已經有選擇的項目時，按下 <kbd>Down Arrow</kbd> 會自動 _focus_ 在該選項上。
  - 否則，_focus_ 在第一個選項上。

- <kbd>Up Arrow</kbd> (Optional)：
  _focus_ 至最後一個選項上。

- <kbd>Escape</kbd>：
  如果 _popup_ 正在顯示就會關閉它。
  Optional，如果 _popup_ 當前隱藏，按下 <kbd>Escape</kbd> 會清除 [combobox] 的數值。

- <kbd>Enter</kbd>：
  如果當前 _focus_ 在建議選項上時，

  - 接收該選項之數值並帶入至輸入欄位，
  - 或是執行該選項的預設行為。
    例如，在通訊軟體上，選擇訊息接收者時，除了會加入該名接收者至清單之外，也會清空當前輸入欄位以便輸入下一位接收者。

- 在 _editable_ 的情況下，部分實作會識別用戶輸入並阻擋不正確的字被輸入。
- 在 _non-editable_ 的情況下，部分實作會移動 _focus_ 至輸入字之前。

- 當 [combobox] 在 _editable_ 時，
  它必須支援該裝置的[標準單行文字輸入快捷鍵][mac-keyboard-shortcuts]

- <kbd>Alt + Down Arrow</kbd> (Optional)：
  開啟 _popup_ 但不轉移 _focus_。

- <kbd>Alt + Up Arrow</kbd> (Optional)：
  如果 _popup_ 正在開啟
  - 關閉 _popup_
  - 如果當前 _focus_ 在 _popup_ 上，轉移 _focus_ 回 [combobox]

## WAI-ARIA 規則，狀態，跟參數 (測試項目)

- 元件符合 [input] 並且具備 [combobox role][combobox_role]
- 元件須具備 [aria-controls] 其數值會對應到作為 _popup_ 的元件，
  注意，[aria-controls] 只需要出現在 _popup_ 顯示時，但即便參照的元件隱藏一樣是合法的。
- _popup_ 元件具備 [listbox][listbox_role], [tree][tree_role], [grid][grid_role], 或是 [dialog][dialog_role]。
- 若 _popup_ 並非 [listbox][listbox_role] 則必須具備 [aria-haspopup]，
  [aria-haspopup] 的數值必須是 [tree][tree_role], [grid][grid_role], 或是 [dialog][dialog_role]。
  注意，[combobox role][combobox_role] 預設 [aria-haspopup] 為 [listbox_role]

- 當 _popup_ 隱藏時，帶有 [combobox role][combobox_role] 的元件必須設定 [aria-expanded] 為 `false`，顯示時則為 `true`。
  注意，[combobox role][combobox_role] 元件的 [aria-expanded] 預設為 `fales`。

- 當 [combobox] 接收到 _focus_ 時，[DOM focus] 必須設置在 [combobox] 元件上。
- 當 [listbox][listbox_role], [tree][tree_role], [grid][grid_role] 被 _focus_ 時，
  [DOM focus] 維持在 [combobox] 上，
  且 [combobox] 須設置 [aria-activedescendant]，其數值須對應當前 _focus_ 的選項。

- 當 [combobox] 控制 [listbox][listbox_role], [tree][tree_role], [grid][grid_role] 時，
  當前選擇的數值對應到的 [option][option_role], [gridcell][gridcell_role], [treeitem][treeitem_role]，
  必須設定 [aria-selected] 為 `true`。

- [combobox] 需配有一個 _label_，可以透過 [label] 元件，
  或是透過 [aria-labelledby] 指定作為 _label_ 的元件，
  或是透過 [aria-label] 作為 _label_ 數值。

- [combobox] 必需配有 [aria-autocomplete] 且設置以下數值以辨識其行為：
  - _none_: 當 popup 顯示時，建議選項的數值並不會根據用戶輸入而改變。
  - _list_: 當 popup 顯示時，上面會顯示建議選項。
    當 [combobox] 為 _editable_ 時，其建議選項會根據用戶輸入而更動。
  - _both_: 當 popup 顯示時，上面會顯示建議選項，其建議選項會根據用戶輸入而更動。
    此外，被自動填上的字段，被視為 _completion string_，
    此字段需被高亮，且對應選項需有 _selected_ 狀態。

<!--  -->

[combobox]: https://www.w3.org/WAI/ARIA/apg/patterns/combobox/
[listbox]: https://www.w3.org/WAI/ARIA/apg/patterns/listbox/
[menubutton]: https://www.w3.org/WAI/ARIA/apg/patterns/menubutton/
[grid]: https://www.w3.org/WAI/ARIA/apg/patterns/grid/
[tree]: https://www.w3.org/WAI/ARIA/apg/patterns/treeview/
[dialog]: https://www.w3.org/WAI/ARIA/apg/patterns/dialogmodal/

<!--  -->

[google]: https://www.google.com/
[headlessui]: https://headlessui.com/react/combobox
[react-spectrum]: https://react-spectrum.adobe.com/react-spectrum/ComboBox.html#example
[select-only combobox]: https://www.w3.org/WAI/ARIA/apg/example-index/combobox/combobox-select-only.html
[combobox-autocomplete-none]: https://www.w3.org/WAI/ARIA/apg/example-index/combobox/combobox-autocomplete-none.html
[combobox-autocomplete-both]: https://www.w3.org/WAI/ARIA/apg/example-index/combobox/combobox-autocomplete-both.html
[combobox-autocomplete-list]: https://www.w3.org/WAI/ARIA/apg/example-index/combobox/combobox-autocomplete-list.html
[grid-combo]: https://www.w3.org/WAI/ARIA/apg/example-index/combobox/grid-combo.html
[combobox-datepicker]: https://www.w3.org/WAI/ARIA/apg/example-index/combobox/combobox-datepicker.html

<!--  -->

[aria-controls]: https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-controls
[combobox_role]: https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/combobox_role
[listbox_role]: https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/listbox_role
[tree_role]: https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/tree_role
[grid_role]: https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/grid_role
[dialog_role]: https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/dialog_role
[aria-haspopup]: https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-haspopup
[aria-expanded]: https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-expanded
[aria-activedescendant]: https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-activedescendant
[dom focus]: https://developer.mozilla.org/en-US/docs/Web/API/Document/activeElement
[option_role]: https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/option_role
[gridcell_role]: https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/gridcell_role
[treeitem_role]: https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/treeitem_role
[aria-selected]: https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-selected
[aria-labelledby]: https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-labelledby
[aria-label]: https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-label
[aria-autocomplete]: https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-autocomplete

<!--  -->

[label]: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/label
[mac-keyboard-shortcuts]: https://www.howtogeek.com/681662/35-mac-text-editing-keyboard-shortcuts-to-speed-up-typing/
[input]: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input
[tabindex]: https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/tabindex
[what-is-an-accessible-name]: https://www.tpgi.com/what-is-an-accessible-name/
