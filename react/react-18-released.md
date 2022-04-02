---
title: "React v18.0"
author: [reactteam]
---

React 18 已經發佈到 npm 上了！

在我們最新的貼文中，我們分享了如何升級你的應用程式到 React 18。
這篇貼文我們將會帶你概覽一遍 React18 的新功能，還有他所彰顯的未來方向。

最新版本直接為你帶來了效能優化，
像是 自動批次處理，新的 API 像是 `startTransition`，還有 `Suspense` 將支援串流 server-side rendering。

React 18 的許多新功能是基於我們新的並行渲染，
這個幕後工程帶來許多強大的可能性。
並行版 React 並非強制啟用，你可以在你需要並行功能時再去開啟他。
但我們已經預見他將會給應用程序開發者帶來極大的衝擊。

我們花了很多年的時間研究跟開發 React 的並行機制，
並且格外注意如何照顧好舊的使用者使其漸進式的導入新的功能。
去年夏季，我們成立了 React 18 工作團隊用來募集來自社群的專業意見，
以保證能夠提供整個 React 生態環境更加平穩的升級體驗。

我們在 React Conf 2021 分享了眾多新的觀點

- 在 [the keynot](https://www.youtube.com/watch?v=FZ0cG47msEk&list=PLNG_1j3cPCaZZ7etkzWA7JfdmKWT0pMsa) 中，
  我們解釋了 React 18 的任務是如何讓開發者能夠更容易建構出優良使用者體驗的產品。

- [Shruti Kapoor](https://twitter.com/shrutikapoor08) [示範如何使用 React 18 新的功能](https://www.youtube.com/watch?v=ytudH8je5ko&list=PLNG_1j3cPCaZZ7etkzWA7JfdmKWT0pMsa&index=2)

- [Shaundai Person](https://twitter.com/shaundai) 帶我們領略了 [使用 Suspense 於串流型伺服器渲染](https://www.youtube.com/watch?v=pj5N-Khihgc&list=PLNG_1j3cPCaZZ7etkzWA7JfdmKWT0pMsa&index=3)

下面會提供完整的概略，例如 什麼是這次釋出需要關注的部分，開始並行渲染。

_註記給 React Native 開發者：React 18 將為 React Native 導入新的架構。更多資訊詳見 [React Conf keynote here](https://www.youtube.com/watch?v=FZ0cG47msEk&t=1530s)._

## 什麼是並行渲染? {#what-is-concurrent-react}

這次 React 18 最重要的新功能是我們希望你永遠都不需要考慮到的部分：並行處理。
我們猜絕大部分應用程式開發者都同意，但這反而使函式庫維護方變有點複雜了。

其實並行處理並不是什麼新功能，他是一個新的底層機制，讓 React 可以在同時間提供不同版本的 UI。

你可以當作並行處理只是些實作細節 - 它真正價值是他打開了我們新的未來方向。
React 在底層實作用了一些比較古早的實作技術，像是 優先級隊列 跟 多重緩衝。
但是你已經不會在我們公開 APIs 中看到這些概念了。

當我們設計 APIs 時，我們致力於隱藏實作細節。
作為一個 React 開發者，
我們應該專注於 _什麼_ 使用者體驗是你想提供的，而 React 負責 _如何_ 實現這些體驗。
所以我們並不希望 React 開發者必需要知道 並行處理 的背後機制。

然而，在並行版 React 這已經並不只是實作細節而已 -
他是從本質改變了 React 核心的渲染模型。
隨然並行處理到底底層如何運作依然不是非常重要，
但卻值得你從廣義角度了解他的概觀。

其中一項關鍵要素在 並行版 React 就是 渲染是可以被中斷的。
當你升級到 React 18，在加入任何有關於並行處理的功能之前，
渲染基本上跟前一個版本的 React 基本是一樣的 - 單一，無法中斷，同步。
同步渲染的情況下，當你開始刷新畫面，沒有任何辦法中斷中間的過程，一直到使用者可以看到畫面結果。

但在並行渲染就完全不是這樣運作，
React 可以在渲染更新的過程中暫停，之後在繼續進行。
他甚至可以直接一次捨棄掉當前在進行的渲染。

React 保證即使渲染被中斷也不會影響 UI 出現的穩定性。
為了這個，他會等 DOM 操作結束，直到整個畫面樹被完整處理。
因為這項功能，React 可以在背景準備新的畫面但不會造成主執行緒阻塞，
這表示我們的畫面可以立即回應使用者的輸入事件，即便是在大型渲染任務過程中，建立流暢的使用者體驗。

另一個範例是重用利用狀態。
並行版 React 即便將畫面上的某個區塊整個移除，但當他之後被加回來時可以直接重用他之前的狀態。
舉個例子，當使用者切換到別的 tab 後在切換回來時，React 應該要保留前一次的畫面以及他的狀態應該要跟之前一樣。
在之後的小版本更新，我們計畫加入一個新的元件叫 `<Offscreen>` 用於這個套路。
同樣的，在使用者用到之前，你就可以透過 Offscreen 在背景準備好 UI。

並行渲染是個強大的新工具，且大部分的新功能是基於它來辦到的。
包含 Suspense, transitions, 還有 伺服器串流渲染。
但是 React 18 只是我們意圖要打造的新基礎的開端。

## 漸進的導入並行功能 {#gradually-adopting-concurrent-features}

技術上來說，並行渲染是個大更新。
因為並行渲染可被中斷，元件狀態明顯跟開啟之前是完全不同的。

在我們的測試中，在 React 18 我們更新了千個以上元件。
我們發現即便在並行渲染的機制下，近乎所有現存的元件完全不用任何改動就可以繼續運作。
然而，還是有一些需要額外的變動。
雖然這些異動極小，但你依然有能力可以完全不用改動到他們。
再次強調 React 18 的新渲染機制， **只有在你的應用程式有用到新功能的時候才會開啟**。

整個更新策略是我們希望你的應用程序用 React 18 跑的時候，不會搞壞已經寫好的 code。
然後你就可以逐步的開始導入並行機制。
你可以用 [`<StrictMode>`](/docs/strict-mode.html) 來幫助你在開發階段尋找並行處理相關的錯誤。
Strict Mode 在實際產品階段中並不會啟用，
但在開發階段，他會給你給你一些額外的警告還有二次執行函式以確保幂等性。
他不會捕捉任何錯誤，他只是用來避免你做出一些常見的錯誤。

在你升級到 React 18 之後，你將可以立刻使用並行功能。
例如，你可以用 startTransition 來切換不同的畫面而不會阻塞使用者輸入。
或是 useDeferredValue 來節流昂貴的重新渲染。

然而，站在長遠角度，我們希望你主要是透過一些已經導入 並行處理 的套件跟框架來加入並行功能。
大部分的情況，你不會需要直接用到並行處理 APIs。
例如，比起開發者直接調用 startTransition 來切換到新畫面，
應該直接使用那些已經包好 startTransition 的 router 函式庫。

可能需要花些時間讓這些函式庫升級到可以相容並行處理。
我們已經提供新的 APIs 讓函式庫開發者更簡單的享受到並行處理的優勢。
在這過度期間，請耐心等候開發者逐步跟上 React 生態的遷移。

更多資訊，可以看我們之前的貼文：[How to upgrade to React 18](https://reactjs.org/blog/2022/03/08/react-18-upgrade-guide.html).

## 使用 Suspense 於資料相關框架 {#suspense-in-data-frameworks}

在 React 18, 你已經可以在 Relay, Next.js, Hydrogen, 或是 Remix 使用 Suspense 來抓資料。
將 Suspense 加入 hoc (higher order component) 用於抓資料在技術上是可行的，
但以普遍來說不建議這麼做。

在未來，我們可能會釋出額外的原生支援，讓你更輕松的夠過 Suspense 來獲取資料，也許不用透過仿間的框架。
但是當你需要深入的整合進你的應用程式架構像是：你的 router, 你的 data layer, 你的伺服器渲染環境時，Suspense 是非常有幫助的。
所以長遠來看，我們希望 函式庫 跟 框架 將可以在 React 生態圈扮演重要角色。

在前一版本的 React，你也可以在客戶端使用 Suspense 跟 React.lazy 來做程式碼分離。
但在我們的角度，Suspense 的用途可以更加廣泛比起只適用於加載程式碼，
同樣的 Suspense 應該可以負責各種異步處理 (加載程式，資料，圖片 ... etc)

## 伺服器元件依然在開發中 {#server-components-is-still-in-development}

[**Server Components**](https://reactjs.org/blog/2020/12/21/data-fetching-with-react-server-components.html) 是即將到來的新功能，
用來提供開發者建構應用程式橫跨 伺服器端 跟 客戶端，
透過結合更強的互動性的客戶端應用跟傳統的伺服器渲染增加效能。
伺服器元件的主旨並非跟並行版 React 有所耦合，
但是他在設計上跟並行功能像是 Suspense 跟 伺服器串流渲染 非常合得來。

伺服器元件依然在實驗階段，
但我們預計在 18.x 小版號釋出初始版本。
在這期間，我們會繼續跟其他的框架開發者像是 Next.js, Hydrogen, 或 Remix
一起精進這個提案，讓他準備可以上戰場。

## React 18 有什麼新東西 {#whats-new-in-react-18}

### 新功能: 自動批次處理 {#new-feature-automatic-batching}

批次處理是指 React 會將 多個狀態更新 集中成一個，在重新渲染，以達到更好的效能。
沒有自動批次處理，我們只能透過 React 的事件處理來做到批次更新。
但在 promises, setTimeout, 原生或是其他的事件處理預設是不會被批次的。
透過他，我們的更新會自動被批次化：

```js
// 以前：只有 React 事件會批次
setTimeout(() => {
  setCount((c) => c + 1);
  setFlag((f) => !f);
  // React 將會刷新畫面兩次，耕具每次狀態變更 (沒有批次)
}, 1000);

// 以後：在 timeouts, promises 中更新時
// 原生的事件處理或是其他的都會被批次處理
setTimeout(() => {
  setCount((c) => c + 1);
  setFlag((f) => !f);
  // React 只會重新渲染一次 (這就是批次)
}, 1000);
```


更多資訊，可以參考 [Automatic batching for fewer renders in React 18](https://github.com/reactwg/react-18/discussions/21).

### 新功能: Transitions 漸變 {#new-feature-transitions}

漸變是 React 的一個新概念用來區分 立即 或是 非立即 的更新。

- **立即更新** 會作用於直接性的互動，像是 打字，點擊，觸碰 等等
- **漸變更新** 用於將 UI 從舊的模樣轉場至新的模樣

立即更新像是 打字，點擊，觸碰 需要立刻的回饋給用戶以符合人類的心理模型，不然用戶會覺得 "怪"。
但漸變不同於前者，因為用戶並沒有需要知道畫面數值改變的中間過程。

例如，當你在下拉選單選擇一種過濾條件，
你預期按鈕會立刻給你點擊反饋，
但下方的過濾結果刷新是可以不用立刻，些微的延遲不會被發覺且也很正常。
如果你在結果顯示前，再次改變了過濾條件也沒有關係，因為你只在意最後的結果是什麼。

大致上，為了提供最好的使用者體驗，
一個的使用者輸入應該要同時反饋 立即更新 跟 非立即的耕興。
你可以在 input event 中加入 startTransition API 來告知 React
哪些更新是要立刻反饋的，而哪些可以 "漸變"：

```js
import { startTransition } from "react";

// 立刻：顯示打了什麼
setInputValue(input);

// 標示接下來所有變更為 漸變更新
startTransition(() => {
  // 漸變：顯示結果
  setSearchQuery(input);
});
```

被包在 startTransition 之中的會視為 非即時更新，且如果有更多立即更新像是 點擊或是鍵盤輸入發生時，是可以被中斷的。
如果漸變被使用者中斷 (例如，在一行中打很多字)，
React 會直接捨棄舊有還沒完成的渲染程序，只會渲染最新的。

- `useTransition`: 這個 hook 用來開始漸變，包含一個數值用於追蹤 暫定狀態。
- `startTransition`: 一個 method 當沒辦法使用 hook 時，可以用來開始漸變

在並行渲染中，漸變也可以透過中斷更新而用於優化。
如果內容被重新觸發更新，漸變可以在背景渲染新的內容，並告訴 React 可以先使用當前的內容。
(詳參 [Suspense RFC](https://github.com/reactjs/rfcs/blob/main/text/0213-suspense-in-react-18.md) 獲取更多資訊).

[這邊可以看漸變的文件](/docs/react-api.html#transitions).

### 新的 Suspense 暫止 功能 {#new-suspense-features}

Suspense lets you declaratively specify the loading state for a part of the component tree if it's not yet ready to be displayed:
Suspense 讓你可以為某個你還沒準備好的呈現在元件樹上的部分，宣告特定的加載狀態，

```js
<Suspense fallback={<Spinner />}>
  <Comments />
</Suspense>
```

Suspense 提供你原生的聲明式介面加載狀態概念，讓你藉由他建構更高階的功能。

我們在幾年前曾介紹過 閹割版的 Suspense。
然而，唯一的用途只有用於 React.lazy 的程式碼分離，而且在伺服器端並不支援。

在 React 18, 我們加入伺服器端支援 Suspense 且透過並行渲染拓展了他的可能性。

當結合了 漸變 API 後，Suspense 將在 React 18 獲得完整的能力，
當你在漸變過程中進行暫止，React 將會避免已經可見的內容被備用元件替換。
取而代之的，React 將會延遲渲染直到獲得足夠多的資料以迴避掉不好的加載狀態。

更多，請看 RFC [Suspense in React 18](https://github.com/reactjs/rfcs/blob/main/text/0213-suspense-in-react-18.md).

### 新的客戶端跟伺服器端渲染 APIs {#new-client-and-server-rendering-apis}

在這次的釋出中我們有機會重新設計我們提供給客戶端跟伺服器端的 APIs.
這項異動允許我們的使用者即便升級至 React18 也可以繼續使用在 React 17 中的舊 APIs。

#### React DOM Client {#react-dom-client}

These new APIs are now exported from `react-dom/client`:
新的 APIs 可以在 `react-dom/client` 找到：

- `createRoot`：建立根節點 用於 `render` 跟 `unmount` 的新方法。用於取代 `ReactDOM.render`，React 18 的功能必須要用他才能運作。
- `hydrateRoot`：用於 hydrate 伺服端渲染應用程序。用於取代 `ReactDOM.hydrate` 並整合了新的 React DOM 伺服器 API， React 18 的功能必須要用他才能運作。

`createRoot` 和 `hydrateRoot` 可以接受一個新的參數叫 `onRecoverableError`，
當 React 在渲染過程中遇到錯誤需要復原時，它可以用來 logging。

React 預設會使用 [`reportError`](https://developer.mozilla.org/en-US/docs/Web/API/reportError) 來輸出錯誤 或是 使用 `console.error` 在舊的瀏覽器。

[到這邊看更多 React DOM Client 的文件](/docs/react-dom-client.html).

#### React DOM Server {#react-dom-server}

These new APIs are now exported from `react-dom/server` and have full support for streaming Suspense on the server:
新的 APIs 現在在 `react-dom/server` 且支援完整的 伺服器串流渲染：

- `renderToReadableStream`：用於 Node 環境的串流
- `renderToReadableStream`：用於近代環境，像是 Deno 或是 Cloudflare 的 workers。

現存的 `renderToString` 方法會繼續運作，但不建議使用。

[到這邊看更多 React DOM Server 的文件](/docs/react-dom-server.html).

### 新的嚴格模式行為 {#new-strict-mode-behaviors}

在未來，我們計畫將要加入新的功能，讓 React 可以新增或移除介面上的區塊時保留狀態。
例如，當使用者切換 tab 到其他畫面再回來時，
React 應該要可以立刻顯示之前的畫面，
為了這個，React 會 卸載 跟 重載 畫面樹，使用跟之前同樣的元件狀態。

這個功能將會帶來更好的效能，但是這需要更加彈性話的元件。
因為會需要 加載 跟 摧毀 很多次。
大部分的 effects 將會正常運作不需要做任何改變，
但有些 effects 是假定你只會 加載 跟 摧毀 一次。

為了面對這個問題，React 18 介紹了新的嚴格模式 僅用於 開發階段。
這個新的檢查機制會自動的 加載 跟 卸載 你的所有元件，
無論元件是被第一次加載，或是使用之前狀態重新加載。

在此之前，React 會加載元件並建立 effects：

```
* React mounts the component.
  * Layout effects are created.
  * Effects are created.
```

在 React 18 嚴格模式下，React 將會在開發階段中，模擬 卸載 跟 重新加載：

```
* React mounts the component.
  * Layout effects are created.
  * Effects are created.
* React simulates unmounting the component.
  * Layout effects are destroyed.
  * Effects are destroyed.
* React simulates mounting the component with the previous state.
  * Layout effects are created.
  * Effects are created.
```

[到這邊看更多確保重複運用狀態的文件](/docs/strict-mode.html#ensuring-reusable-state).

### New Hooks {#new-hooks}

#### useId {#useid}

`useId` 是新的 hook 用於在客戶端跟伺服器端產生唯一 ID，用於避免 hydration mismatches。
他主要便於讓元件函式庫易於整合 accessibility APIs 需要用的 唯一值。
它解決了 React 17 版以及更之前版本的諸多問題，
但他更加重要的用途在於解決新的 串流伺服器渲染 HTML 時的無順序問題。
[看文件](/docs/hooks-reference.html#useid).

#### useTransition {#usetransition}

`useTransition` 和 `startTransition` 讓你可以標記哪些狀態更新是非即時的。
其他的狀態更新預設會被視為立即的。
React 將允許立即性的狀態更新 (例如，更新文字輸入) 中斷非即時性的更新 (例如，渲染搜尋結果的列表)
[看文件](/docs/hooks-reference.html#usetransition)

#### useDeferredValue {#usedeferredvalue}

`useDeferredValue` 讓你可以延遲重新渲染非立即性的部分到畫面樹。
類似於防抖，但相對於前者他有更多進階的優勢。
首先他並非是透過固定時間來延遲，
所以 React 可以試圖在首次渲染後才去做延遲渲染的畫面刷新。
而且延遲渲染可以被中斷，所以不會阻塞使用者輸入。
[看文件](/docs/hooks-reference.html#usedeferredvalue).

#### useSyncExternalStore {#usesyncexternalstore}

`useSyncExternalStore` 是用於讓外部存儲支援並行讀取的新 hoooks
透過強制讓存儲同步更新。
當實作訂閱外部資料來源時，他移除了 useEffect 的必要性
而且建議所有的函式庫要透過這個跟 React 進行整合。
[看文件](/docs/hooks-reference.html#usesyncexternalstore).

> Note
>
> `useSyncExternalStore` 是給函式庫開發者的，不是給應用程式的

#### useInsertionEffect {#useinsertioneffect}

`useInsertionEffect` 是個新的 hook 用來讓 CSS-in-JS 函式庫在渲染過程注入 styles 時可以追蹤效能問題，
這個 hook 將會在 DOM 操作結束後執行，
但是會在 layout effect 發生前讀取新的 layout。
他解決了 React 17 以及之前的諸多問題，
但在 React 18 更重要，因為 React 會在並行渲染的過程中將主導權交回瀏覽器，
讓他有機會重新計算畫面。
[看文件](/docs/hooks-reference.html#useinsertioneffect).

> Note
>
> `useInsertionEffect` 是給函式庫開發者的，不是給應用程式的