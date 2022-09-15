# 如何製作對話視窗 tabbable【 dialog | 我不會寫 React Component 】

hashtags: `#react`, `#components`, `#accessibility`, `#dialog`, `#tabbable`

本篇接續前篇 [如何製作對話視窗 dialog【 dialog | 我不會寫 React Component 】](./intro.md)  
可以先看完上一篇在接續此篇。

讓人很意外的是，  
有蠻多工程師其實並不知道，實作對焦邏輯是一件很不容易的事。

因為接下來要繼續製作 `dialog` 就會遇到要控制焦點的邏輯，  
理論上這個篇章複雜到應該要獨立寫成一篇，  
甚至要獨立成一個 package，不應該自己寫，  
但這邊還是試著實作一遍。

## Spec: Tabbable

以下情況被視為 `tabbable`:

- `<button>`
- `<input>`
- `<select>`
- `<textarea>`
- `<a>` 並帶有 `href` 屬性。
- `<audio>` 和 `<video>` 帶有 `controls` 屬性。
- `<details>` 底下的第一個 `<summary>`

- `<details>` 但沒有 `<summary>`
- 帶有 `contenteditable` 屬性的元件
- 任何帶有非負數的 `tabindex` 屬性的元件

但如果下面情況成立，則上面的也不會被視為 `tabbable`:

- 帶有負數的 `tabindex` 屬性
- 帶有 `disabled` 屬性
- 節點自身或是它的祖宗被 `display: none` 隱藏
- 帶有 `visibility: hidden` 樣式
- 被包進 `<details>` 元件裡面，除了第一個 `<summary>` 元件
- `<input type="radio">`元件但是有其他 radio 已經被 `checked`
- 雖然是表單欄位 (button, input, select, textarea) 但被放在 `disabled` 的 `<fieldset>` 底下

如果你想了解更詳細的清單，可以參考[這個][focusable]。

然後在實作中，  
如果你覺得節點應該要被包含進 tabbable 但卻沒有時，  
你只需要加上 `tabindex="0"` 就行了，  
或是你想要某個節點被去掉，就加上 `tabindex="-1"`，  
因為這個領域依然還有[跨瀏覽器互相不匹配][more-detail]的問題，  
如果你需要，就手動加上去就行了。

> [Don’t Use Tabindex Greater than 0][dont-use-tabindex-greater-than-0]。

看到上面的規格，我真的很想直接跳過，  
但我們還是繼續吧。

因為規格中有些部分是需要動到真實 DOM 運算，像是 `display` 跟 `visibility`，  
所以這邊使用 [cypress] 去跑真實的瀏覽器環境。

為了不要太佔篇幅，下面附上 E2E Test 的連結：

- [isTabbable](https://github.com/kayac-chang/react-wai/blob/main/packages/tabbable/cypress/e2e/isTabbable.cy.ts)
- [tabbable](https://github.com/kayac-chang/react-wai/blob/main/packages/tabbable/cypress/e2e/tabbable.cy.ts)

### Solution

為了方便性，先抽出幾個我覺得比較常用的 utils。

[utils.ts](https://github.com/kayac-chang/react-wai/blob/main/packages/tabbable/src/utils.ts)

```ts
type TagMap = HTMLElementTagNameMap;
export function is<Type extends keyof TagMap>(
  type: Type,
  node?: Node | null
): node is TagMap[Type] {
  return node?.nodeName === type.toUpperCase();
}

export function getTabindex(_node: Element) {
  const node = _node as HTMLElement;

  const tabindex = Number(node.getAttribute("tabindex"));

  if (
    is("audio", node) ||
    is("video", node) ||
    is("details", node) ||
    node.isContentEditable
  ) {
    return tabindex || 0;
  }

  return tabindex;
}
```

測試環境下，  
沒有辦法做像是 `display: none` 或是 `visibility: hidden` 之類，  
需要真實畫面繪製運算的邏輯，  
提供一個選項讓他可以 by pass。

```ts
export interface Option {
  displayCheck?: boolean;
}

export const defaultOption: Option = {
  displayCheck: true,
};
```

為了保持單純，不做太複雜的程式架構。

[isTabbable.ts](https://github.com/kayac-chang/react-wai/blob/main/packages/tabbable/src/isTabbable.ts)

```ts
function isTabbable(node: Element, option = defaultOption) {
  if (node.hasAttribute("disabled")) {
    return false;
  }

  if (option.displayCheck) {
    if (node.getClientRects().length <= 0) {
      return false;
    }

    const style = getComputedStyle(node);
    if (style.visibility === "hidden") {
      return false;
    }
  }

  if (node.hasAttribute("tabindex")) {
    return getTabindex(node) >= 0;
  }

  if (
    node.hasAttribute("contenteditable") &&
    node.getAttribute("contenteditable") !== "false"
  ) {
    return true;
  }

  if (
    is("details", node.parentNode) &&
    is("summary", node) &&
    node.parentNode.querySelector("summary") === node
  ) {
    return true;
  }

  if (is("details", node.parentNode) && !node.parentNode.open) {
    return false;
  }

  if (is("details", node) && !node.querySelector("summary")) {
    return true;
  }

  if (
    (is("audio", node) || is("video", node)) &&
    node.hasAttribute("controls")
  ) {
    return true;
  }

  if (is("a", node) && node.hasAttribute("href")) {
    return true;
  }

  if (
    node.matches(
      "fieldset[disabled] > legend:first-child :where(input, button, select, textarea)"
    )
  ) {
    return !node.closest("fieldset[disabled]")?.matches("fieldset[disabled] *");
  }

  const enabled = !node.matches("fieldset:disabled *");

  if (is("button", node) && enabled) {
    return true;
  }

  if (is("input", node) && enabled && node.type === "radio") {
    if (!node.name) return true;

    const name = CSS.escape(node.name);

    if (node.form) {
      const selector = `input[type="radio"][name=${name}]:checked`;
      const checked = node.form.querySelector(selector);

      return !checked || node === checked;
    }

    const root = node.getRootNode() as Element;
    const selector = `input[type="radio"][name=${name}]:checked:not(form *)`;
    const checked = root.querySelector(selector);

    return !checked || node === checked;
  }

  if (is("input", node) && enabled) {
    return true;
  }

  if (is("select", node) && enabled) {
    return true;
  }

  if (is("textarea", node) && enabled) {
    return true;
  }

  return false;
}
```

這裡用到了 [Tree Walker][tree-walker]，這樣就不用自己實作 [DFS][dfs]。

[tabbable](https://github.com/kayac-chang/react-wai/blob/main/packages/tabbable/src/tabbable.ts)

```ts
function* traverse(root: Element, option = defaultOption) {
  const walker = document.createTreeWalker(
    root,
    NodeFilter.SHOW_ELEMENT,
    (node) =>
      isTabbable(node as Element, option)
        ? NodeFilter.FILTER_ACCEPT
        : NodeFilter.FILTER_SKIP
  );

  while (walker.nextNode()) {
    yield walker.currentNode as Element;
  }

  return;
}

function tabbable(root: Element, option = defaultOption) {
  const zero_index_elements: Element[] = [];
  const positive_index_map = new Map<number, Element[]>();

  for (const element of traverse(root, option)) {
    const index = getTabindex(element);

    if (index === 0) {
      zero_index_elements.push(element);
    } else if (positive_index_map.has(index)) {
      positive_index_map.get(index)?.push(element);
    } else {
      positive_index_map.set(index, [element]);
    }
  }

  const positive_index_elements = Array.from(positive_index_map.entries())
    .sort((a, b) => a[0] - b[0])
    .flatMap(([_, elements]) => elements);

  return [...positive_index_elements, ...zero_index_elements];
}
```

[dont-use-tabindex-greater-than-0]: https://adrianroselli.com/2014/11/dont-use-tabindex-greater-than-0.html
[more-detail]: https://github.com/focus-trap/tabbable#more-details
[focusable]: https://allyjs.io/data-tables/focusable.html
[cypress]: https://www.cypress.io/
[tree-walker]: https://developer.mozilla.org/en-US/docs/Web/API/TreeWalker
[dfs]: https://en.wikipedia.org/wiki/Depth-first_search
