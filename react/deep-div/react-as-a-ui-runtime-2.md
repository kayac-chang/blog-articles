# React Deep Div 2 - React as a UI runtime 2

## Components

我們已經看過可以回傳 React element 的函式：

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

他們被稱作 components。  
讓我們可以打造屬於自己的工具箱，像是 buttons, avatars, comments 等等。  
Components 是 React 的 麵包跟奶油。

元件可以接收一個參數 — 一個物件。  
它包含了 “props 屬性” (“properties” 的縮寫)。  
這邊的 `showMessage` 是個 prop。就很像是具命參數。

## Purity

React 元件被預設為純函式對應於 props。

```js
function Button(props) {
  // 🔴 Doesn't work
  props.isActive = true;
}
```

一般來說 React 不建議異動性質的操作。  
(我們之後會談到比較理想的 UI 更新方式。)

然而，區域變數異動是完全可以的。

```js
function FriendList({ friends }) {
  let items = [];
  for (let i = 0; i < friends.length; i++) {
    let friend = friends[i];
    items.push(<Friend key={friend.id} friend={friend} />);
  }
  return <section>{items}</section>;
}
```

在渲染期間，我們建立的 `items` 並沒有其他元件有用到，  
所以我們可以隨我們開心的異動它直到這個元件給我們渲染結果。  
沒有一定需要完全地避免區域變動。

同樣的，惰性初始化也是可以的，儘管他不是完全的純淨：

```js
function ExpenseForm() {
  // Fine if it doesn't affect other components:
  SuperCalculator.initializeIfNotReady();

  // Continue rendering...
}
```

如果呼叫那個元件多次都正常且皆不影響其他元件的渲染的話，  
React 並不在意他是否 100% 純淨，像是嚴格的 FP 世界。  
比起純粹，幂等性在 React 更重要。

也就是說，React 元件是不允許有可以被用戶直接看到的 side effects 的。  
換言之，如果只是單純調用元件函式，就不應該在畫面上產生任何變化。

## Recursion

我們該如何在元件中使用元件？  
因為元件只是函式所以我們可以這樣呼叫他們：

```js
let reactElement = Form({ showMessage: true });
ReactDOM.render(reactElement, domContainer);
```

然而，這不是 React 使用元件的慣用方式。

取而代之，元件的理想使用方式就跟我們前面已經看過的機制是一樣的 — React elements。  
這表示我們不用直接呼叫那個元件函式，  
而是讓 React 幫你做這件事。

```js
// { type: Form, props: { showMessage: true } }
let reactElement = <Form showMessage={true} />;
ReactDOM.render(reactElement, domContainer);
```

然後在 React 裏面的某處，你的元件會被執行：

```js
// Somewhere inside React
let type = reactElement.type; // Form
let props = reactElement.props; // { showMessage: true }
let result = type(props); // Whatever Form returns
```

元件的函式名稱普遍為首字母大寫。  
當 JSX 轉換時，  
看到 `<Form>` 時，會使用那個物件作為 `type`，  
用 `<form>` 時，會用字串。

```js
console.log((<form />).type); // 'form' string
console.log((<Form />).type); // Form function
```

這裡並沒有全域的註冊機制 — 當字面上寫 `<Form />` 那他就表示 `Form`。  
如果 `Form` 在局部作用域中不存在時，  
你會看到 JavaScript 錯誤，就像平常你使用錯誤的變數名稱一樣。

所以，當 element 的 type 是個函式時 React 會做什麼？  
他會執行你的元件，問那個元件想要渲染什麼 element。

這個程序會持續遞迴的執行，  
更詳細的描述可以看[這裡](https://reactjs.org/blog/2015/12/18/react-components-elements-and-instances.html)。  
簡單來說，他看起來像這樣：

你：`ReactDOM.render(<App />, domContainer)`
React：嗨 App，你想渲染啥？

App：我渲染 `<Layout>` 裡面有 `<Content>`。
React：嗨 `<Layout>`，你想渲染啥？

Layout：我要在 `<div>` 裡面渲染我的子元素。我的子元素是 `<Content>` 所以我猜他應該要在 `<div>` 裏。
React：嗨 `<Content>`，你想渲染啥？

Content：我要渲染 `<article>` 跟一些文字，還有 `<Footer>` 在裡面。
React：嗨 `<Footer>`，你要渲染啥？

Footer：我要渲染 `<footer>` 跟一些文字。
React：好喔，給你：

```js
// Resulting DOM structure
<div>
  <article>
    Some text
    <footer>some more text</footer>
  </article>
</div>
```

這就是為什麼我們說 reconciliation 是遞迴。
當 React 走過整個 element tree，他可能會遇到 element 他的 type 是元件。
他就會執行它，並沿著返回的 React element 繼續往下走。
最終我們會執行完全部的元件，然後 React 就會知道如何更動宿主樹。

同樣的 reconciliation 規則我們之前已經討論過了。
如果 type 在同樣的位置被改變 (由 index 或是 key 決定)。
React 會把裏面的宿主實例捨棄，並重新建造他。

## Inversion of Control

你可能會開始思考：
為什麼我們不直接呼叫元件就好了？
為什麼要寫 `<Form />` 而不是 `Form()`?

因為，如果讓 React 知道你的元件的話，它可以把事情做得更好。
比起在你遞迴的呼叫他們直接生成 React element 樹。

```js
// 🔴 React 不知道 Layout 跟 Article 存在。
// 因為你直接呼叫他們。
ReactDOM.render(Layout({ children: Article() }), domContainer);

// ✅ React 知道 Layout 跟 Article 存在。
// 由 React 呼叫他們。
ReactDOM.render(
  <Layout>
    <Article />
  </Layout>,
  domContainer
);
```

這是經典的 [inversion of control 依賴反轉](https://en.wikipedia.org/wiki/Inversion_of_control) 範例。
讓 React 呼叫我們的元件，我們會獲得些有趣的特徵：

- **元件將不只是函式。**  
  React 可以讓獲得元件獲得自己的 state。  
  一個好的 runtime 會提供基本的抽象層來處理這些基本問題。  
  就像我們已經提過的，  
  React 目標是針對畫面樹的渲染跟處理交互。  
  如果你直接呼叫元件，那你就必須自己處理這些功能。

- **元件的 type 也會參與到 reconciliation 裏。**  
  讓 React 呼叫你的元件，你也順便讓他更加了解你的樹狀結構。  
  例如，當你從 `<Feed>`頁移動到 `<Profile>` 頁面，  
  React 不會試圖重用裏面的宿主實例 — 就像先前你將 <button> 替換成 <p>。  
  所有的 state 應該要消失 — 在你想要渲染不同畫面的時候，通常是件好事。  
  你不會想要在 `<PasswordForm>` 跟 `<MessengerChat>` 切換時保留 input 的狀態，  
  即便可能在兩個樹狀結構中，`<input>` 的位置意外的撞到了。

- **React 可以暫緩 reconciliation**  
  如果讓 React 控制你的元件，他能做很多有趣的事情。  
  例如，它可以讓瀏覽器在元件互叫的期間做事情，  
  所以重新渲染龐大的元件樹不會造成主執行緒阻塞。  
  如果不仰賴 React 而是自己實作這些是非常困難的。

- **更好的除錯體驗**
  如果元件是頭等公民，我們可以打造完整的開發工具來優化開發體驗。

讓 React 呼叫你的元件函式還有最後一個好處，就是惰性計算。  
我們接著來看看。

## Lazy Evaluation

在 JavaScript 執行函式之前，參數會先被計算出來：

```js
// (2) This gets computed second
eat(
  // (1) This gets computed first
  prepareMeal()
);
```

這通常符合 JavaScript 開發者的預期，  
因為 JS 函式可以有隱性的 side effects。

如果我們執行函式時，不知怎麼他沒有被執行，但函式結果卻在其他某處被使用了，這會很毛。

然而，React 元件是相對純粹的。  
如果我們知道他不會出現在畫面上，那就沒必要去執行他。

例如以下元件，把 `<Comments>` 放進 `<Page>` 裏：

```js
function Story({ currentUser }) {
  // return {
  //   type: Page,
  //   props: {
  //     user: currentUser,
  //     children: { type: Comments, props: {} }
  //   }
  // }
  return (
    <Page user={currentUser}>
      <Comments />
    </Page>
  );
}
```

`Page` 可以在 `Layout` 中渲染他的子節點。

```js
function Page({ user, children }) {
  return <Layout>{children}</Layout>;
}
```

(在 JSX 裏，`<A><B /></A>` 跟 `<A children={<B />} />` 是一樣意思。)

但假設他進到提前返回的判斷呢？

```js
function Page({ user, children }) {
  if (!user.isLoggedIn) {
    return <h1>Please log in</h1>;
  }
  return <Layout>{children}</Layout>;
}
```

如我我們將 `Comments()` 作為函式呼叫，  
他會直接執行，不論 `Page` 是否需要渲染它：

```js
// {
//   type: Page,
//   props: {
//     children: Comments() // Always runs!
//   }
// }
<Page>{Comments()}</Page>
```

但假設我們是用 React element，那他就不會執行 `Comments`：

```js
// {
//   type: Page,
//   props: {
//     children: { type: Comments }
//   }
// }
<Page>
  <Comments />
</Page>
```

這讓 React 決定何時跟為何去調用他們。  
如果我們的 `Page` 元件忽略了他的 `children props`，而是渲染 `<h1>Please log in</h1>`，  
React 不會去呼叫那個 `Comments` 函式。

這很好，因為它省去了沒必要的渲染工作，並且讓程式碼變得不那麼脆落。
(我們就不用去在意 `Comments` 是否被捨棄，當用戶已經登出之後 — 因為他沒被執行。)
