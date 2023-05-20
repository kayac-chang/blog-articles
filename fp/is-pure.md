# 是純的！函式編程設計

###### tags: `fp`

## 聽眾調查

那在正式開始之前，我們先來調查一下。

- 沒有聽過函式編程，請在聊天室打 1。
- 有聽過函式編程但是沒有用過，請在聊天室打 2。
- 有用過函式編程，請在聊天室打 3。

那我想來問問各位，為什麼想要來聽這門課呢？

- 沒了解過想試試看
- 感覺很值得學習
- 看起來很炫

**我自己也覺得很炫炮拉！**

## 動機：說一段故事

如果我們有一台擁有無限計算能力的機器，
那他可以用來解決什麼問題？
他可不可以自動地解決問題？
是不是有些問題他解決不了？如果有的話是什麼？
如果這些機器採用不同的設計，他們的算力相同嗎？

λ-calculus。
這套魔法威力十分強大，
幾乎任何一個可被計算的問題，都可以用它來解決，
但也因為這套古老的黑魔法實在太過超前，
當時並沒有受到太多人關注。

反觀他的學生艾倫圖靈，設計出的圖靈機，
被約翰馮諾伊曼應用在人類第一台電子計算機上。

巨大的光芒輾壓過了黑魔法，
原本阿隆佐的鉅作，
也大概會像古今眾多不得志的人們一樣，
消失在歷史的洪流之中。

二十年後，在 MIT 任教的約翰，
跟往常一樣在圖書館內做他的讀書狂，
但今天，他在角落發現了一本生灰的魔法書，
大受啟發的他應用了書中的概念，
製作了一套至今都還在用的高階語言，lisp，
並在人工智慧上獲得了巨大的成就，
而事實上，人工智慧就是約翰提出的概念。

基於 lisp 這位老祖宗的成功，
眾多應用了 λ-calculus 的語言也在日後被設計了出來，
它的設計彷彿打一開始就預判了當今時代會遭遇到的問題，
我相信未來，函式編程的概念只會更加廣泛被應用在各種場合上。

## 特色

### Pure Function

pure function 其實就是 function，
只是它多了幾個限制。

- 給予同樣的 input 就會得到同樣的 output。
- 沒有副作用 side effect。

以下來看幾個例子

這是

```typescript
function increment(n: number) {
  return n + 1;
}
```

```typescript
let n: number = 0;
function increment() {
  n += 1;
}
```

### First Class Function

讓函式可以向一般的變數一樣被宣告跟傳遞。

> 在沒有支援一級函式的語言，
> 你需要 `class` 並建立他的 instance
> 才有辦法使用 `bar` 這段程式碼。

```typescript
function onClick() {
  console.log("hello");
}
button.addEventListener("click", onClick);
```

```java
button.setOnClickListener(new View.OnClickListener() {
    @Override
    public void onClick(View v) {
        System.out.println("hello");
    }
});
```

> 在有支援一級函式的語言，
> 函式就像宣告 `class` `String` `Number` 一樣，
> 你可以直接建立並執行它。

```typescript
function bar() {}

bar();
```

> 你可以直接將函式當成參數，
> 就跟在傳遞 `String` `Number` 一樣

```typescript
function foo() {
  console.log("hello foo");
}

function bar(fn) {
  fn();
  console.log("hello bar");
}

bar(foo);
```

補充 callback 跟 sort

### Immutability

資料在傳遞的或是在計算的過程中，
都沒有可能被改變。

可變的操作

```typescript
const user = {
  hasLogin: false,
};
function login(user) {
  user.hasLogin = true;
}
login(user);

console.log(user); // { hasLogin: false }
console.log(user); // { hasLogin: true }
```

不可變性的操作

```typescript
const user = {
  hasLogin: false,
};

function login(user) {
  return {
    hasLogin: true,
  };
}

console.log(user); // { hasLogin: false }

const hasLoginUser = login(user);
console.log(hasLoginUser); // { hasLogin: true }
console.log(user); // { hasLogin: false }
```

可變性操作，異動了原本的物件屬性，
而不可變性操作，則是生成了一個新的物件。

## 他的解決了什麼問題

### 單元測試

理想上，我應該只需要檢查函式 傳入值 跟 回傳值，
當我的傳入值跟回傳值符合預期，
表示這個函式符合我的期待。

如果我們總是需要額外檢查其他的部分，
像是執行後導致其他物件的狀態改變，
那我們需要考慮的因素就會增加，
測試就會更加困難，
越困難的東西就會越容易出錯，
測試就會越來越失去它的意義。

測試的主要目的是為了建立我們對於這段程式的信心，
如果測試項目會出現各式各樣的**例外**以及**意外**，
那這樣的測試結果又要如何帶給我們信心呢？

### 除錯

你曾有過花費一整天甚至一週就為了解決一個 bug 嗎？
自從我開始實踐函式編程後，除錯就沒有超過 1 小時。

為什麼函式編程這麼容易除錯，
因為錯誤百分之百可以被重現，
函式編程的程式碼沒有除了 input 跟 output 之外的事情需要判斷，
我們只需要檢查從哪個部分開始，
數值不符合我們的預期，
並沿著 call stack 往下追朔到根源就行了。

### 並發

不需要做任何的改動，所有的函式編程程序從一開始就可以並發。

因為本來就不用 lock，也就從來不需要擔心 dead lock 或是競速。

函式編程單一線程內都不能修改數據了，
就不用說多線程之間。

這使得我們可以毫無壓力的添加線程，
這樣的先天條件讓函式編程能在現今多核運算的時代如魚得水，
在未來，函式編程的設計只會越來越廣泛被應用，
這是必然的現象。

## 觀念的延展

> 函式編程眾多的特性跟概念，很多是延展出來的，
> 彼此環環相扣，就如同數學一樣。

First Class Function
-> Closure
-> Higher Order Function
-> Curring
-> Compose

## 腦筋急轉彎

## 課程

### 共學課

### 專題演講

## 附錄

### 什麼是 side effect 副作用

在編程中，副作用是指對程序或系統狀態的任何更改，而這些更改不在正在執行的函數或方法中。

副作用可以包括對變量、數據結構、外部資源（如數據庫或文件系統）的更改，
甚至對其他函數的行為造成更改。

編程中的副作用的例子包括：

- 寫入文件或數據庫
- 修改變量或數據結構
- 在控制台上輸出或記錄輸出
- 發送網絡請求
- 拋出異常
- 觸發中斷或信號

一般來說，副作用可以使代碼更難理解和測試，因為它們引入了依賴關係和程序不同部分之間的潛在交互。為了減少副作用的影響，一些編程范式（如函數編程）強調使用沒有副作用的純函數。
