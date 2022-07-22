# React Deep Div 2 - React as a UI runtime 3

## State

我們稍早之前有提到關於 React 如何辨別 element 在樹狀結構中的位置，  
提到 React 如何重用或是建立新的宿主實例。

宿主實例可以擁有所有類型的局部狀態：focus, selection, input 等等。  
我們希望，概念上屬於同一介面的元件在渲染更新過程要保留這些狀態。  
同時希望當我們渲染概念上屬於不同元件時，這些狀態必須要銷毀。  
(像是從 `<SignupForm>` 換頁到 `<MessengerChat>`)

**局部狀態是這麼有用以致 React 也讓你自己的元件可以擁有他。**  
元件依然是函式，但因為 React 的支援，他獲得了一些對於做 UI 很方便的特性，  
像是，局部狀態被綁定在樹狀結構的某一位置就是其中之一。

我們將這個特色稱作 `Hooks`。例如，`useState` 就是這個 Hook。

```js
function Example() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>Click me</button>
    </div>
  );
}
```

他會回傳一對數值：當前狀態跟一個用於更新他的函式。

陣列解構讓我們可以隨心所欲的對狀態變數命名。  
例如，我命名了一對 `count` 跟 `setCount`，但他是可以叫做 `banana` 跟 `setBanana`。  
下面的部分，我會用 `setState` 來繼續講解。

## Consistency

即便我們將 reconciliation 的程序拆成小份非阻塞的形式，  
我們依然需要在單一同步階段對宿主樹時進行實際操作。  
這樣我們才能保證用戶不會看到只更新到一半的介面，  
且瀏覽器不用處理沒必要讓用戶看到的中間狀態，導致 layout 跟 style 重新計算。

這就是為什麼 React 把他的工作拆成 “render phase 渲染階段” 跟 “commit phase 提交階段”，  
渲染階段就是 React 呼叫你的函式跟執行 reconciliation 的時候。  
這期間可以安全地中斷，且未來會變成異步的。  
提交階段就是當 React 處理宿主樹的時候，此時此刻永遠是同步的。

## Memoization

當父節點因為執行了 `setState` 安排了一次更新，React 預設會 reconciles 整個子樹，  
那是因為 React 並不知道父節點的更新會不會影響到子節點，而且預設 React 會保持狀態畫面的一致性。  
這聽起來性能消耗很大，但實際上對於中小型的樹結構沒有太大的問題。

當樹的深度跟廣度越來越大時，你可以讓 React [暫存](https://en.wikipedia.org/wiki/Memoization)那個子樹，  
並在前後次渲染的 `prop` 淺比對是相同時，重複使用上次的結果：

```js
function Row({ item }) {
  // ...
}

export default React.memo(Row);
```

現在父元件 `<Table>` 執行 `setState` 時，如果 `item` 的參考跟上次相同的話，reconciling 會跳過 `Row`。

你可以透過 [`useMemo` Hook](https://reactjs.org/docs/hooks-reference.html#usememo) 做個別表達式獲得更精細的暫存。  
該暫存會跟元件樹的位置綁定，而且會跟著局部狀態一起被銷毀。  
他只會保留最後一次的計算結果。

React 預設是不希望去暫存元件。  
許多元件在更新過程中會不斷收到不同的 `props`，對他們進行暫存只是單純浪費記憶體。

## Raw Models

好笑的是，React 根本沒有用 “reactivity” 系統來支持精密更新。  
換言之，任何在頂層的更新都會觸發 reconciliation 而不是只針對受更新影響的元件進行更動。

這是他有意為之的設計決定。  
對於面向用戶的 web 應用程式而言，[交互時間](https://calibreapp.com/blog/time-to-interactive)是非常關鍵的指標，  
而遍歷整個模型且一個個的設置細粒度監聽會浪費前面提到的時間。  
此外在絕大多數的應用交互，會是小 (按鈕 hover) 或是大 (頁面漸進) 的更新，  
這時細粒度的監聽是浪費記憶體資源。

其中一項核心設計原則便是，React 處理原始數據。  
如果你從網路接收到一堆 JavaScript 物件，  
你可以直接灌進元件而無需前置處理。  
也沒有任何小技巧在討論你可以獲取哪些屬性，  
或是當結構變化時會造成性能缺損。  
React 渲染複雜度是 `O(view size 畫面的大小)` 而不是 `O(modal size 資料的大小)`，  
而且你可以使用 [windowing](https://react-window.vercel.app/#/examples/list/fixed-size) 來減少畫面的大小。

有些類型的應用程式使用細粒度的訂閱是有幫助的 — 像是股票監控。  
這是少數需要 “所有東西需要在同一時間內持續更新”。  
使用命令式的方式的確可以優化此類代碼，  
React 似乎不是很適合用在此類情況。  
但一樣的，你可以在 React 之上實作自己的精細訂閱系統。

注意，有一些常見的效能問題即便是 細粒度的訂閱 或是 “reactivity” 系統也沒辦法救的。  
例如，渲染一個深層的樹狀結構而不發生瀏覽器阻塞 (這會發生在頁面切換)。  
追蹤異動並不會讓他變得更快 — 實際上反而讓他變更慢，因為要監控的話需要我們做更多的事情。  
其他問題像是，在渲染畫面之前我們需要等待資料。  
在 React，我們試圖透過[並行渲染](https://reactjs.org/blog/2018/03/01/sneak-peek-beyond-react-16.html)來解決此類問題。

## Batching

同一個事件可能會觸發多個元件的狀態更新。  
這個範例有點不自然但足夠示範這個常見的模式：

```js
function Parent() {
  let [count, setCount] = useState(0);
  return (
    <div onClick={() => setCount(count + 1)}>
      Parent clicked {count} times
      <Child />
    </div>
  );
}

function Child() {
  let [count, setCount] = useState(0);
  return (
    <button onClick={() => setCount(count + 1)}>
      Child clicked {count} times
    </button>
  );
}
```

當事件發生，子元件的 `onClick` 先觸發 (並觸發他的 `setState`)。  
然後，父元件也透過了 `onClick` 觸發了他的 `setState`。

如果 React 為了回應 `setState` 而立刻重新渲染，  
最後會造成重新渲染 子元件 兩次：

```js
*** Entering React's browser click event handler ***
Child (onClick)
  - setState
  - re-render Child // 😞 unnecessary
Parent (onClick)
  - setState
  - re-render Parent
  - re-render Child
*** Exiting React's browser click event handler ***
```

第一次的子元件渲染會被浪費，  
且我們無法讓 React 跳過子元件第二次渲染。  
因為父元件可能會根據狀態更新而拋入不同的資料。

**這就是為什麼 React 要在事件處理中做批次更新：**

```js
*** Entering React's browser click event handler ***
Child (onClick)
  - setState
Parent (onClick)
  - setState
*** Processing state updates                     ***
  - re-render Parent
  - re-render Child
*** Exiting React's browser click event handler  ***
```

在元件中呼叫 `setState` 並不會立刻造成重新渲染。  
取而代之的是，React 會先執行過所有有關事件處理，然後集中所有更新於單次的渲染。

批次處理對效能有好處，  
但可能會讓你覺得很奇怪，如果的程式寫這樣：

```js
const [count, setCount] = useState(0);

function increment() {
  setCount(count + 1);
}

function handleClick() {
  increment();
  increment();
  increment();
}
```

如果我們一開始 `count` 設成 `0`，那上面這段只是呼叫了三次 `setCount(1)`。
為了解決這個，`setState` 可以接收 “updater” 函式：

```js
const [count, setCount] = useState(0);

function increment() {
  setCount((c) => c + 1);
}

function handleClick() {
  increment();
  increment();
  increment();
}
```

React 會將 updater 函式丟進 queue 裏，  
在之後會按照原本的順序執行他們，  
重新渲染的結果 `count` 就會是 `3`。

當狀態邏輯複雜到已經不只是呼叫幾次 `setState`，  
我建議改用 [useReducer Hook](https://reactjs.org/docs/hooks-reference.html#usereducer) 來處理局部狀態。  
它就像 “updater” 的升級版，你可以將每次的更新命名：

```js
const [counter, dispatch] = useReducer((state, action) => {
  if (action === "increment") {
    return state + 1;
  } else {
    return state;
  }
}, 0);

function handleClick() {
  dispatch("increment");
  dispatch("increment");
  dispatch("increment");
}
```

`action` 參數可以是任何東西，雖然通常是丟物件。

## Call Tree

程式語言運行通常會有個 [call stack](https://www.freecodecamp.org/news/understanding-the-javascript-call-stack-861e41ae61d4)。  
當函式 `a()` 呼叫 `b()` 然後 `b` 又呼叫 `c()`，  
在 JavaScript 引擎某處會有個資料結構像是 `[a, b, c]` 用來追蹤你現在在哪跟接下來要執行什麼，  
當 `c` 執行完畢，他的 call stack frame 就消失了！不再需要用到。  
我們就按照時間退回 `b`，然後在退回 `a`，然後 call stack 被清空。

當然，React 是用 JavaScript 在運行的，自然要遵守 JavaScript 的規則。  
但我們可以想像 React 有屬於他自己的 call stack 用來記憶我們當前渲染的元件，  
像是，`[App, Page, Layout, Article /* we're here */]`。

但 React 跟一般程式語言運行環境不太一樣的是，他目的是要渲染畫面樹。  
這些樹需要保持活性以便我們跟他互動，  
DOM 並不會在我們第一次執行 `ReactDOM.render()` 之後就消失。

有點隱喻的意思，但我喜歡將 React 元件稱作 “call tree” 而不是 “call stack”。  
當我們離開 `Article` 元件，他的 React “call tree” frame 並不會被銷毀。  
我們需要[在某處](https://medium.com/react-in-depth/the-how-and-why-on-reacts-usage-of-linked-list-in-fiber-67f1014d0eb7)保留他的局部狀態跟宿主實例的參考。

這些 “call tree” frames 會跟著局部狀態跟宿主實例一起被銷毀，  
但只有在 reconciliation 說他必須摧毀的時候。  
如果你曾經看過 React 的原始碼，  
你可能會看到剛剛提的這些 frames 其實就是 [Fibers](<https://en.wikipedia.org/wiki/Fiber_(computer_science)>)。

Fibers 是局部狀態真正存在的地方。  
當某處的狀態被更新，  
React 會標記其下的 Fibers 需要進行 reconciliation，之後便會調用這些元件。

## Context

在 React，我們透過 props 傳遞資料到其他元件。  
有的時候，大多數的元件需要同樣的東西 — 例如，當前選擇的視覺主題。  
如果將他一層層地傳遞會顯得很笨重。

在 React，我們透過 [Context](https://reactjs.org/docs/context.html) 解決。  
他基本上就像是元件的 [dynamic scoping](http://wiki.c2.com/?DynamicScoping)。  
他像是個蟲洞，讓你可以丟東西給他，然後讓所有在其下的子元件都讀得到它，  
並且在他更動時重新渲染。

```js
const ThemeContext = React.createContext(
  "light" // Default value as a fallback
);

function DarkApp() {
  return (
    <ThemeContext.Provider value="dark">
      <MyComponents />
    </ThemeContext.Provider>
  );
}

function SomeDeeplyNestedChild() {
  // Depends on where the child is rendered
  const theme = useContext(ThemeContext);
  // ...
}
```

當 `SomeDeeplyNestedChild` 渲染時，  
`useContext(ThemeContext)` 會樹狀節點中尋找最接近它的 `<ThemeContext.Provider>`，  
並使用其 `value`。

(實際上，React 維護了一個 context stack 在其渲染時。)

如果在其之上沒有 `ThemeContext.Provider`，  
`useContext(ThemeContext)` 的結果就會是 `createContext()` 的預設數值，  
在這邊的範例，就是 `'light'`。

## Effects

我們稍早前提到 React 元件在渲染期間，不應該有可被觀測的 side effects。  
但是 side effects 有時是必須的。  
我們可能需要管理 focus, 在 canvas 上繪圖, 訂閱資料來源。

在 React，這些會透過定義 effect 來解決：

```js
function Example() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    document.title = `You clicked ${count} times`;
  });

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>Click me</button>
    </div>
  );
}
```

盡可能的，React 延遲執行 effects 直到瀏覽器重新繪製畫面之後。

這樣很好，
因為像是訂閱資料來源這類程式不應該影響到
[time to interactive](https://calibreapp.com/blog/time-to-interactive)
跟 [time to first paint](https://web.dev/first-meaningful-paint/)。  
(也是有個很少用到的 [Hook](https://reactjs.org/docs/hooks-reference.html#uselayouteffect)
可以不用延遲而且同步的執行事情，請避免使用它。)

Effects 不會只執行一次。  
他會在元件第一次顯示，跟他更新之後執行。  
在 Effects 中能觸及當前的 props 跟 state，就像先前的 `count` 範例。

Effects 可能也需要被清除，像是之前提到的訂閱。  
為了清除，effect 可以回傳一個函式：

```js
useEffect(() => {
  DataSource.addSubscription(handleChange);
  return () => DataSource.removeSubscription(handleChange);
});
```

React 會在下次執行這個 effect 之前執行回傳的函式，  
或是在元件被銷毀之前。

有時候，每次渲染都重新執行 effect 是不理想的。  
你可以告訴 React 當你指定的變數沒有改變的時候跳過那次 effect 的執行。

```js
useEffect(() => {
  document.title = `You clicked ${count} times`;
}, [count]);
```

然而，這很容易變成過度優化且可能會造成一些問題，  
如果你不是很熟悉 JavaScript 的 closures 運作方式的話。

例如，這段程式碼有問題：

```js
useEffect(() => {
  DataSource.addSubscription(handleChange);
  return () => DataSource.removeSubscription(handleChange);
}, []);
```

他錯在因為 `[]` 告訴它 “永遠不要重新執行這段 effect”。  
但是 effect 將已經將定義在外面的 `handleChange ` 函式包進去了。  
然後 `handleChange` 可能參照任何的 props 跟 state：

```js
function handleChange() {
  console.log(count);
}
```

如果我們永遠不讓 effect 重跑，  
Effect 中的 `handleChange` 會一直指向第一次渲染時的版本，  
而裏面的 `count` 將永遠是 `0`。

為了解決這些，請確定會改變的東西都要在 dependency array 裏面，包含函式：

```js
useEffect(() => {
  DataSource.addSubscription(handleChange);
  return () => DataSource.removeSubscription(handleChange);
}, [handleChange]);
```

Depending on your code, you might still see unnecessary resubscriptions
because handleChange itself is different on every render.
The useCallback Hook can help you with that.
Alternatively, you can just let it re-subscribe.
For example, browser’s addEventListener API is extremely fast,
and jumping through hoops to avoid calling it might cause more problems than it’s worth.

取決你的程式碼，  
你可能還是會看到沒必要的重複註冊，  
因為 `handleChange` 每次渲染都會改變，  
這時 [useCallback](https://reactjs.org/docs/hooks-reference.html#usecallback) 就會幫上忙。  
或者，你可以就讓它重新註冊。  
例如，瀏覽器的 `addEventListener` API 非常快，  
但為了避免使用它而導致更多問題，不是很值得。

(你可以在[這裡](https://reactjs.org/docs/hooks-effect.html)學到更多有關 `useEffect` 跟 其他 React 提供的 Hooks)

## Custom Hooks

因為 Hooks 像是 `useState` 或是 `useEffect` 單純只是函式呼叫，  
我們可以結合他們變成我們的 Hooks：

```js
function MyResponsiveComponent() {
  const width = useWindowWidth(); // Our custom Hook
  return <p>Window width is {width}</p>;
}

function useWindowWidth() {
  const [width, setWidth] = useState(window.innerWidth);
  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  });
  return width;
}
```

客製 Hooks 讓不同的元件可以分享並重用這些狀態邏輯。  
注意狀態本身不是共享的。  
每個 Hook 呼叫會定義他們自己獨立的狀態。

(你可以在[這裡](https://reactjs.org/docs/hooks-custom.html)學到如何寫自己的 Hook)

## Static Use Order

你可以將 `useState` 想成定義 “React 狀態變數” 的語法。  
當然他並是真的語法，我們實際還是在寫 JavaScript。  
但當我們將 React 作為一個運行環境看待時，  
因為 React 透過 JavaScript 在描繪整個 UI 樹，  
他的特色有時候非常接近於語言本身。

如果可以將 `use` 變成語法，將其用在最上面也就說得通了：

```js
// 😉 Note: not a real syntax
component Example(props) {
  const [count, setCount] = use State(0);

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
}
```

假設把它放到判斷式或是回調函式或是元件外面是什麼意思呢？

```js
// 😉 Note: not a real syntax

// This is local state... of what?
const [count, setCount] = use State(0);

component Example() {
  if (condition) {
    // What happens to it when condition is false?
    const [count, setCount] = use State(0);
  }

  function handleClick() {
    // What happens to it when we leave a function?
    // How is this different from a variable?
    const [count, setCount] = use State(0);
  }
```

React 狀態是綁定於元件的，且這些元件被定義在樹狀結構裡。  
如果 `use` 是真正的語法，那他需要定義在元件函式的最上方也就說得通了：

```js
// 😉 Note: not a real syntax
component Example(props) {
  // Only valid here
  const [count, setCount] = use State(0);

  if (condition) {
    // This would be a syntax error
    const [count, setCount] = use State(0);
  }
```

這就跟 `import` 必須要在 module 的最上方相似。

**當然，`use` 並不是真正的 syntax。**(他也不會帶來什麼幫助，反而會帶來摩擦。)

當然，React 確實預期所有 Hooks 的執行只能在元件的最上層且不在條件判斷之內。  
這個 Hooks 的規則可以透過 linter 插件增強。  
有很多關於這種設計的激烈爭論，但在實際上我並沒有看到它讓人困惑的地方。  
我也寫了另外一篇討論為什麼通常的替代方案提議[沒有用](https://overreacted.io/why-do-hooks-rely-on-call-order/)。

而 Hooks 內部被實作成 [linked lists](https://dev.to/aspittel/thank-u-next-an-introduction-to-linked-lists-4pph)。  
當你執行 `useState`，我們會將指針移動到下一組物件。  
當我們離開元件的 “call tree” frame 時，我們會將結果儲存直到下次渲染。

[這篇文章](https://medium.com/@ryardley/react-hooks-not-magic-just-arrays-cd4f1857236e)
為 Hooks 內部是如何實作的提供了簡單的解釋。  
陣列可能比連結串列更簡單理解：

```js
// Pseudocode
let hooks, i;
function useState() {
  i++;
  if (hooks[i]) {
    // Next renders
    return hooks[i];
  }
  // First render
  hooks.push(...);
}

// Prepare to render
i = -1;
hooks = fiber.hooks || [];
// Call the component
YourComponent();
// Remember the state of Hooks
fiber.hooks = hooks;
```

(如果你很嚴謹，可以看[真實的原始碼](https://github.com/facebook/react/blob/main/packages/react-reconciler/src/ReactFiberHooks.new.js))

這就是大致上 `useState()` 如何獲得正確狀態的方式了。  
就像我們之前學到的，“匹配” 對 React 來說不是什麼新東西 —
reconciliation 基於同樣的方式在確認 elements 在渲染前後是否匹配。
