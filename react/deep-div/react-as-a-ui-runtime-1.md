# React Deep Div 2 - React as a UI runtime 1

## Host Tree

有些程式會輸出數字，有些輸出詩詞。  
不同的語言與他們的運行環境通常都會為了特定的目的進行優化，  
React 也不例外。

React 程式通常輸出的是 **一個會隨時間更動的樹狀資料結構**，  
它可以是 DOM tree，iOS 結構，PDF 原型樹，或是 JSON 物件。  
然而，通常，我們想要透過它來呈現某些 UI。

我們將稱之為 “host tree 宿主樹” 因為它是不屬於 React 管轄的其他宿主環境 — 像是 DOM 或是 iOS。  
通常宿主樹會有自己的重點 API，React 層則是建立在其之上。

所以 React 的好處在哪？  
非常抽象，他幫助你寫出可以透過一些像是交互事件，網路請求，計時器之類的外部事件來操作複雜的宿主樹的程式，  
而且其結果是可以被預判的。

一個特化工具會比瑞士刀更加好用，  
並且受益於這個限制，React 做了兩項前提：

- **穩定性。**  
  宿主樹通常相對穩定，且大多數的更新不會直接改變整個結構。  
  如果每分每秒都要重新排列組合所有可交互的元素，這會變得超難使用。  
  那個按鈕跑去哪了？為什麼我的畫面在抖？

- **規律性。**  
  宿主樹可以被拆分元件，  
  並且外觀跟行為保持一致(像是按鈕，列表，頭像) 而不是隨機的形狀。

這項前提在所有種類的 UI 都基本一致，  
然而，React 在對應沒有穩定的 “patterns” 的情況就不太合適。  
像是，React 可以幫助你寫出 Twitter 的客戶端，  
但是可能對於撰寫 3D 水管螢幕保護程式沒什麼幫助。

## Host Instances

宿主樹由多個節點組成，我們稱他們為 "host instances 宿主實例"。

在 DOM 環境中，宿主實例就是正常的 DOM 節點 — 那些你透過 `document.createElement('div')` 取得的物件。  
在 iOS, 宿主實例可以是能夠從 JS 對應到原生畫面的唯一值。

宿主實例可以擁有自己的參數 (像是，`domNode.className` 或是 `view.tintColor`)。  
他們可能可以包含其他的宿主實例作為子元素。  
(這邊都跟 React 無關 — 這邊是討論宿主環境)。

而且通常會有可以操作宿主實例的 API。  
例如說，DOM 提供 APIs 像是 `appendChild`, `removeChild`, `setAttribute` 諸如此類。  
在 React apps，你通常不會呼叫到那些 APIs。那是 React 的工作。

## Renderers

renderer 會告訴 React 如何跟宿主環境溝通，跟管理宿主實例。  
React DOM, React Native 甚至 Ink 都是 React renderer。

React renderer 能透過以下兩種模式運作。

絕大多數的 renderer 被寫作 “mutating” 模式。  
這個模式跟 DOM 的運作方式一樣：  
建立節點，設置他的參數，然後晚點加入或者移除子節點。  
宿主實例是完全可異動的。

React 也可以運作在 “persistent” 模式。  
這個模式下，宿主環境並沒有提供方法像是 `appendChild()`  
取而代之的是複製父樹並永遠透過取代的方式替換最上層的子節點。  
不可變性讓宿主樹在多執行緒環境下運作更容易。  
React Fabric 就是獲益於此。

作為一個 React 的用戶，你無需了解這幾個模式。  
我只想要強調，React 不僅僅只是從一個模式切換到另一個的轉接器。  
他的真正好處在讓你透過更好的方式操作而不用去在意那些低階層的 API 典範。

## React Elements

在宿主環境中，最小建造單位就是宿主實例 (像是 DOM 節點)。  
而 React 的最小建造單位就是 React element。

React element 即是純 JS 物件。他用來描述宿主實例。

```js
// JSX is a syntax sugar for these objects.
// <button className="blue" />
{
  type: 'button',
  props: { className: 'blue' }
}
```

一個 React element 非常輕量，並且沒有綁任何宿主實例在上面。  
重申，他就僅僅是用於描述你在畫面上看到的東西。

像是宿主實例，React elements 可以呈現樹狀結構：

```js
// JSX is a syntax sugar for these objects.
// <dialog>
//   <button className="blue" />
//   <button className="red" />
// </dialog>
{
  type: 'dialog',
  props: {
    children: [{
      type: 'button',
      props: { className: 'blue' }
    }, {
      type: 'button',
      props: { className: 'red' }
    }]
  }
}
```

(注意：我省略了一些參數，因為他們在這段解釋中不重要)

然而，記得 React elements 並不需要永久識別子。  
他們就是每次用完就要丟掉的。

React element 是不可變動的。  
例如，你不能改變 React element 的子元素或是其參數。  
如果你想要渲染不同的東西，  
你就必須描述新的 React element 樹。

我想，思考 React elements 最好的方式是把當當做 電影的禎畫面。  
他們捕捉畫面到底應該在那個時間點要如何呈現，他們不會改變。

## Entry Point

每個 React renderer 會有一個 “entry point 進入點”。  
這個 API 讓我們告訴 React 將 React element 樹渲染到指定的宿主實例下。

舉例，React DOM 進入點就是 `ReactDOM.render`：

```js
ReactDOM.render(
  // { type: 'button', props: { className: 'blue' } }
  <button className="blue" />,
  document.getElementById("container")
);
```

當你呼叫 `ReactDOM.render(reactElement, domContainer)`  
你實際上是說：“親愛的 React，可以讓 domContainer 宿主樹跟我的 reactElement 一致嗎”。

React 將會對照 `reactElement.type` (在這個例子, 就是 'button')  
並問 React DOM renderer 要怎麼建立這個宿主實例跟設置他參數：

```js
// Somewhere in the ReactDOM renderer (simplified)
function createHostInstance(reactElement) {
  let domNode = document.createElement(reactElement.type);
  domNode.className = reactElement.props.className;
  return domNode;
}
```

在這個範例，基本上 React 就是在做：

```js
let domNode = document.createElement("button");
domNode.className = "blue";

domContainer.appendChild(domNode);
```

如果 React element 在 `reactElement.props.children` 中有子元素，  
那 React 會在第一次渲染遞迴的走訪全部並將宿主實例都建立出來。

## Reconciliation

當我們用同樣的 container 呼叫兩次 `ReactDOM.render()` 會發生什麼事？

```js
ReactDOM.render(
  <button className="blue" />,
  document.getElementById("container")
);

// ... later ...

// 這個應該要 *取代* button 的宿主實例嗎
// 還是對已經存在的那個實例更新？
ReactDOM.render(
  <button className="red" />,
  document.getElementById("container")
);
```

重申，React 的工作就是讓宿主樹跟我們提供的 React element tree 一致。  
接收新的資訊並理解出應該對宿主實例樹做什麼，這個被稱作 reconciliation 。

這邊有兩種方式。  
其中之一簡化版本的 React 可以直接捨棄現存的樹並直接從頭建立新的：

```js
let domContainer = document.getElementById("container");
// Clear the tree
domContainer.innerHTML = "";
// Create the new host instance tree
let domNode = document.createElement("button");
domNode.className = "red";
domContainer.appendChild(domNode);
```

但是在 DOM，這樣做會比較慢且會遺失重要訊息像是 focus, selection, scroll state 等等。  
取而代之，我們希望 React 這樣做：

```js
let domNode = domContainer.firstChild;
// Update existing host instance
domNode.className = "red";
```

換言之，React 必須知道何時應該要更新現存的宿主實例以符合新的 React element，  
而何時又應該建立新的。

這又跑出新的問題了。  
React element 可能每次都不同，  
那概念上，他又該如何知道要使用同一個宿主實例？

在我們的範例中，它很簡單。  
我們渲染出 `<button>` 作為第一個 (且唯一) 的子節點，  
且我們第二次又渲染了一個 `<button>` 在同樣的位置。  
我們已經在宿主實例上有 `<button>` 了，又為何要重新建立它？  
我們直接重用它。

這非常接近 React 如何思考他了。

如果在樹狀結構的同一位置上 element type 在前次跟下次的渲染都一致的話，  
React 會重用已存在的宿主實例。

這邊有個範例粗略地解釋了 React 做了什麼：

```js
// let domNode = document.createElement('button');
// domNode.className = 'blue';
// domContainer.appendChild(domNode);
ReactDOM.render(
  <button className="blue" />,
  document.getElementById("container")
);

// Can reuse host instance? Yes! (button → button)
// domNode.className = 'red';
ReactDOM.render(
  <button className="red" />,
  document.getElementById("container")
);

// Can reuse host instance? No! (button → p)
// domContainer.removeChild(domNode);
// domNode = document.createElement('p');
// domNode.textContent = 'Hello';
// domContainer.appendChild(domNode);
ReactDOM.render(<p>Hello</p>, document.getElementById("container"));

// Can reuse host instance? Yes! (p → p)
// domNode.textContent = 'Goodbye';
ReactDOM.render(<p>Goodbye</p>, document.getElementById("container"));
```

同樣的行為也適用於子樹。  
例如，當我們更新 `<dialog>` 中的兩個 `<button>` 時，  
React 會先決定是否要重用 `<dialog>`，  
而後對每個子節點都不斷重復這個決策步驟。

## Conditions

如果 React 只會在每次更新的 element type 對上時重用宿主實例  
那我們遇到條件渲染時呢？

假設我們想要先只顯示 `input`，  
但之後要在他之前渲染訊息。

```js
// First render
ReactDOM.render(
  <dialog>
    <input />
  </dialog>,
  domContainer
);

// Next render
ReactDOM.render(
  <dialog>
    <p>I was just added here!</p>
    <input />
  </dialog>,
  domContainer
);
```

在這個範例，`<input>` 宿主實例被重新建立。  
React 會走訪整個 element tree，比較前後版本：

- `dialog → dialog`: 可以重用宿主實例嗎？可以 — type 有對上。
  - `input → p`: 可以重用宿主實例嗎？不可以，type 被改變了！  
    必須移除現在的 `input` 並建立新的 `p` 宿主實例。
  - `(nothing) → input`: 必須建立新的 `input` 宿主實例。

所以 React 基本上做了以下事情：

```js
let oldInputNode = dialogNode.firstChild;
dialogNode.removeChild(oldInputNode);

let pNode = document.createElement("p");
pNode.textContent = "I was just added here!";
dialogNode.appendChild(pNode);

let newInputNode = document.createElement("input");
dialogNode.appendChild(newInputNode);
```

這點並不好，因為概念上 `<input>` 並不是被 `<p>` 取代 — 他只是移動了。  
我們不想因為重建 DOM 而遺失他的 selection, focus state, 以及其內容。

雖然這個問題很容易被解決 (我們等等就會看到)，  
這個問題在 React 應用中並不常見。  
很有趣，我們等等會知道為什麼。

實際上，你很少會直接呼叫 `ReactDOM.render`。  
相反，React 應用往往被拆成像這樣的函式：

```js
function Form({ showMessage }) {
  let message = null;
  if (showMessage) {
    message = <p>I was just added here!</p>;
  }
  return (
    <dialog>
      {message}
      <input />
    </dialog>
  );
}
```

這個例子並不會遇到我們剛剛描述的問題。  
這邊採用 物件標記 取代 JSX 會比較容易理解。  
來看 `dialog` 的子樹：

```js
function Form({ showMessage }) {
  let message = null;
  if (showMessage) {
    message = {
      type: "p",
      props: { children: "I was just added here!" },
    };
  }
  return {
    type: "dialog",
    props: {
      children: [message, { type: "input", props: {} }],
    },
  };
}
```

不論 `showMessage` 是 `true` 還是 `false`，  
`<input>` 始終都使在第二子節點，在渲染過程中從未改變。

當 `showMessage` 從 `false` 變成 `true`，  
React 會走訪整個元素樹，比較前後版本：

- `dialog → dialog`: 可以重用宿主實例嗎？可以 — type 有對上。
  - `(null) → p`: 必須插入新的 `p` 宿主實例。
  - `input → input`: 可以重用宿主實例嗎？可以 — type 有對上。

所以 React 基本上做了以下事情：

```js
let inputNode = dialogNode.firstChild;
let pNode = document.createElement("p");
pNode.textContent = "I was just added here!";
dialogNode.insertBefore(pNode, inputNode);
```

現在，沒有任何 `input` 的狀態遺失。

## Lists

通常比較在樹狀結構中同樣位置的 element type 已經足夠判斷是否需要重用或是重建相對應的宿主實例。

但這只適用於子節點是靜態，且不會重新排序。  
上面的範例，即便 `message` 可能只是個洞，  
我們一樣可以知道 `input` 在 `message` 之後，  
而且沒有其他子節點。

但在動態列表，我們沒辦法保證每次的次序都相同：

```js
function ShoppingList({ list }) {
  return (
    <form>
      {list.map((item) => (
        <p>
          You bought {item.name}
          <br />
          Enter how many do you want: <input />
        </p>
      ))}
    </form>
  );
}
```

即便商品列表被重新排序了，  
React 只會看到所有的 `p` 跟 `input` 擁有相同的 type，  
並不知道該如何移動他們。  
(在 React 的視角，這些商品是改變了，但他們的順序沒有變。)

所以，重新排列 10 個商品，對 React 是這樣運作的：

```js
for (let i = 0; i < 10; i++) {
  let pNode = formNode.childNodes[i];
  let textNode = pNode.firstChild;
  textNode.textContent = "You bought " + items[i].name;
}
```

所以比起重新排序，React 實際上只是更新他們。  
這可能會造成效能問題跟可能會發生錯誤。

例如說，在排序後，原本第一個輸入匡內容依然出現在第一個輸入匡中 —  
概念上他應該要對照商品列表中不同的產品！

這就是為什麼每次你要輸出一組 element 陣列時，  
React 都會要求你給予特殊的 `key` 參數：

```js
function ShoppingList({ list }) {
  return (
    <form>
      {list.map((item) => (
        <p key={item.productId}>
          You bought {item.name}
          <br />
          Enter how many do you want: <input />
        </p>
      ))}
    </form>
  );
}
```

`key` 讓 React 可以判斷那個商品是否一樣，  
即便渲染後是在父元素底下的不同的位置。

當 React 看到 `<p key="42">` 在 `<form>` 底下，  
他會檢查前次渲染是否也是 `<p key="42">` 在 `<form>` 底下。

這個方法即便 `<form>` 中的子節點次序改變都依然有效。  
如果兩次渲染時的 key 都相同的話，React 將重用前次的宿主實例，  
並且排序到正確的位置。

注意到，`key` 只會與特定的父元素相關聯，像是 `<form>`。  
React 不會試圖比對不同父元素的 `key` 是否一致。  
(React 並沒有支援無需重新創建元素，卻能夠讓宿主元素在不同父元素間移動的方法。)

給予 `key` 什麼樣的值比較好？  
最好的答案就是：即便順序改變的狀況下，你都可以判斷物件是同一個？  
例如說，在我們的商品列表，產品號是區別其他商品的唯一值。
