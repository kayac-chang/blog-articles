# 錯誤處理

Remix 在 web 應用程式領域打造了一個新的錯誤處理典範，這你一定會愛上。

Remix 會自動捕捉大多數在你的程式中發生的錯誤，無論在 server 或是在 browser，
並且當錯誤發生時渲染到最近的 `ErrorBoundary`。

如果你很熟悉 React class component 的 `componentDidCatch` 跟 `getDerivedStateFromError` 方法，
他就跟他們很像，不過在 server 還提供了額外的錯誤處理機制。

當以下錯誤發生時，Remix 將會自動捕捉錯誤，並渲染到最近的 error boundary：

- 在 browser 渲染期間
- 在 server 渲染期間
- in a loader during the initial server rendered document request
-
- in an action during the initial server rendered document request
- in a loader during a client-side transition in the browser (Remix serializes the error and sends it over the network to the browser)
- in an action during a client-side transition in the browser
