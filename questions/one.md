請教各位一個問題
首先我是要「呼叫別人的ＡＰＩ」，但是別人的ＡＰＩ有版本不同情況 v1.0 跟 v2.0，api 有些微不同，有時候要用 v1.0 的，有時候要用 v2.0 的。
我想請教的問題是我這邊要怎麼設計程式的架構會比較彈性或有更好做法？
目前我是這樣打算與現況： 1.我目前是用 net6.0 版本。 2.呼叫別人ＡＰＩ有用 di 注入的方式，且統一寫在一個 class。 3.相同的 class 名稱但是用 namespace 來區分版本，例如：v1.0.className 跟 v2.0.className

後台常用資源：
圖表樣式：https://developers-dot-devsite-v2-prod.appspot.com/chart/interactive/docs/gallery/linechart.html
元件及參考：https://www.primefaces.org/store/
其他參考：https://www.ui.cn/
學習：https://www.ui.cn/detail/593944.html?nopop=1
學習二：https://www.ui.cn/detail/631985.html
學習三：https://www.ui.cn/detail/615524.html?nopop=1
