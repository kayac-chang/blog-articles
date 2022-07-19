# React - 設計概念

Reference https://github.com/reactjs/react-basic  

此篇的重點在解釋 _React_ 的 API 設計之心理模型，  
意圖解釋清楚這樣設計的來龍去脈。

關於 實際上 _React_ 的實作細節  
充滿像是 _pragmatic solutions_, _incremental steps_, _algorithmic optimizations_, _legacy code_, _debug tooling_ 這些隨著時間變動部分。  
如果少了核心的觀念，很容易就會迷失方向。

一個簡單的心智模型，會幫助你更加了解真相。

## Transformation

_React_ 最核心的概念前提就是，**畫面單純就是資料轉換到不同形式的映照關係**。
同樣的 _input_ 會產生 相同的 _output_，就是 _functional programming_ 中的 _pure function_。

```js
function NameBox(name) {
  return { fontWeight: 'bold', labelContent: name };
}
```

```
'Sebastian Markbåge' -> 
{ fontWeight: 'bold', labelContent: 'Sebastian Markbåge' };
```

## Abstraction

非常重要的一點，UI 要能夠被抽象拆分成可重複利用的部件，
尤其在 UI 十分複雜的情況下。

```js
function FancyUserBox(user) {
  return {
    borderStyle: '1px solid blue',
    childContent: [
      'Name: ',
      NameBox(user.firstName + ' ' + user.lastName)
    ]
  };
}
```

```
{ firstName: 'Sebastian', lastName: 'Markbåge' } ->
{
  borderStyle: '1px solid blue',
  childContent: [
    'Name: ',
    { fontWeight: 'bold', labelContent: 'Sebastian Markbåge' }
  ]
};
```

## Composition

因為每次都還是需要建立新的容器才能處理不同組合，
所以單只是函式呼叫函式是不夠的。
為了達成真正的重用，容器必須可以組合其他的容器。
我們認為，所謂的組合是可以將兩個以上不同的抽象組合成為一個。

```js
function FancyBox(children) {
  return {
    borderStyle: '1px solid blue',
    children: children
  };
}

function UserBox(user) {
  return FancyBox([
    'Name: ',
    NameBox(user.firstName + ' ' + user.lastName)
  ]);
}
```

## State

請理解這件事，
UI 並不是單純呈現 server / business logic 的狀態而已。

實際上有很多的狀態是只屬於 UI 自身，
例如，
文字輸入匡。
scroll 位置。
Toggler。

我們意圖讓資料模型是 immutable，
並且只能透過指定的函式才能更動那個狀態。

```js
function FancyNameBox(user, likes, onClick) {
  return FancyBox([
    'Name: ', NameBox(user.firstName + ' ' + user.lastName),
    'Likes: ', LikeBox(likes),
    LikeButton(onClick)
  ]);
}

// Implementation Details

var likes = 0;
function addOneMoreLike() {
  likes++;
  rerender();
}

// Init

FancyNameBox(
  { firstName: 'Sebastian', lastName: 'Markbåge' },
  likes,
  addOneMoreLike
);
```

> 注意：這邊的範例是透過 side-effects 更新狀態，為了簡化範例。
> 但實際心智模型是他要回傳 下個版本的 state。

## Memoization

連續用同樣的參數呼叫純函式是一種浪費，
透過 memoized 我們可以避免不必要的重複運算。

```js
function memoize(fn) {
  var cachedArg;
  var cachedResult;
  return function(arg) {
    if (cachedArg === arg) {
      return cachedResult;
    }
    cachedArg = arg;
    cachedResult = fn(arg);
    return cachedResult;
  };
}

var MemoizedNameBox = memoize(NameBox);

function NameAndAgeBox(user, currentTime) {
  return FancyBox([
    'Name: ',
    MemoizedNameBox(user.firstName + ' ' + user.lastName),
    'Age in milliseconds: ',
    currentTime - user.dateOfBirth
  ]);
}
```

## Lists

大多數 UI 是某種形式的列表，然後為列表中的每個項目對應生成不同的值。
這形成了一個自然的結構。

```js
function UserList(users, likesPerUser, updateUserLikes) {
  return users.map(user => FancyNameBox(
    user,
    likesPerUser.get(user.id),
    () => updateUserLikes(user.id, likesPerUser.get(user.id) + 1)
  ));
}

var likesPerUser = new Map();
function updateUserLikes(id, likeCount) {
  likesPerUser.set(id, likeCount);
  rerender();
}

UserList(data.users, likesPerUser, updateUserLikes);
```

## Continuations (HOC)

但不幸的，當專案已經有了太多種類的清單時，
我們需要一個 boilerplate 用於處理各種情況，

將 business logic 從函式中移出，
並透過 currying 延遲函式的執行，
再根據使用情況從外面拋入使用。

```js
function FancyUserList(users) {
  return FancyBox(
    UserList.bind(null, users)
  );
}

const box = FancyUserList(data.users);
const resolvedChildren = box.children(likesPerUser, updateUserLikes);
const resolvedBox = {
  ...box,
  children: resolvedChildren
};
```

## State Map

前面看到的，我們可以透過 composition 來避免重工。
現在我們可以將 logic 抽出，並透過傳入 state 至低階級的函式。 

```js
function FancyBoxWithState(
  children,
  stateMap,
  updateState
) {
  return FancyBox(
    children.map(child => child.continuation(
      stateMap.get(child.key),
      updateState
    ))
  );
}

function UserList(users) {
  return users.map(user => {
    continuation: FancyNameBox.bind(null, user),
    key: user.id
  });
}

function FancyUserList(users) {
  return FancyBoxWithState.bind(null,
    UserList(users)
  );
}

const continuation = FancyUserList(data.users);
continuation(likesPerUser, updateUserLikes);
```

## Memoization Map

當我們需要 memoize 列表會更加困難，
所幸，UI 在畫面的呈現位置上是比較穩定的，
同樣的值會出現在同樣的位置，所以整個樹狀結構可以直接 memoization。

```js
function memoize(fn) {
  return function(arg, memoizationCache) {
    if (memoizationCache.arg === arg) {
      return memoizationCache.result;
    }
    const result = fn(arg);
    memoizationCache.arg = arg;
    memoizationCache.result = result;
    return result;
  };
}

function FancyBoxWithState(
  children,
  stateMap,
  updateState,
  memoizationCache
) {
  return FancyBox(
    children.map(child => child.continuation(
      stateMap.get(child.key),
      updateState,
      memoizationCache.get(child.key)
    ))
  );
}

const MemoizedFancyNameBox = memoize(FancyNameBox);
```

## Algebraic Effects

會變得有點煩，當你需要把每個資料傳過不同 level 的抽象層。
如果有方法可以將資料直接在兩個抽象層傳遞而中介層不會知道，這樣會更好。
在 React 這被稱作 "context"。

有的時候，資料的依賴關係並不符合抽象樹。

如果你熟悉 _functional programming_ 的話，他們是透過 _monads_ 處理這些。

```js
function ThemeBorderColorRequest() { }

function FancyBox(children) {
  const color = raise new ThemeBorderColorRequest();
  return {
    borderWidth: '1px',
    borderColor: color,
    children: children
  };
}

function BlueTheme(children) {
  return try {
    children();
  } catch effect ThemeBorderColorRequest -> [, continuation] {
    continuation('blue');
  }
}

function App(data) {
  return BlueTheme(
    FancyUserList.bind(null, data.users)
  );
}
```