# 如何製作輪播 carousel 3【 carousel | 我不會寫 React Component 】

本篇接續前篇 [如何製作輪播 carousel 2【 carousel | 我不會寫 React Component 】](./carousel-2.md)  
可以先看完上一篇再接續此篇。

## Controlling Automatic Slide Rotation 控制自動輪播

用戶可以暫停或是開啟幻燈片輪播，  
對於失能用戶來說這是非常重要的可達性功能。

對於有視覺障礙或是認知障礙的用戶來說，
他們需要足夠的時間來理解幻燈片的內容。

且如果輔助技術無法判斷幻燈片自動切換，  
會造成閱讀十分困難且可能會誤導。

## Spec: Automatic Rotation 自動輪播

```tsx
describe("interval", () => {
  it("the amount of time to delay between automatically cycling an item", async () => {
    setup(100);

    await waitFor(() => {
      expect(screen.getByRole("group", { name: "1 of 6" })).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(screen.getByRole("group", { name: "2 of 6" })).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(screen.getByRole("group", { name: "3 of 6" })).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(screen.getByRole("group", { name: "4 of 6" })).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(screen.getByRole("group", { name: "5 of 6" })).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(screen.getByRole("group", { name: "6 of 6" })).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(screen.getByRole("group", { name: "1 of 6" })).toBeInTheDocument();
    });
  });
});
```

### Solution

最近看到蠻多人寫 timer 寫了很多多餘的程式碼，像是 `ref` 之類的。  
基本上 `useEffect` 就可以解決。

```tsx
type CarouselProps = PCP<
  "section",
  {
    interval?: number;
  }
>;
export function Carousel(props: CarouselProps) {
  const id = useId();
  const [index, dispatch] = useReducer(reducer, 0);
  const next = () => dispatch("asc");
  const prev = () => dispatch("desc");
  const context = {
    items_id: id + "items",
    index,
    next,
    prev,
  };

  useEffect(() => {
    if (!props.interval) return;
    const id = setInterval(next, props.interval);
    return () => clearInterval(id);
  }, [props.interval, next]);

  return (
    <Context.Provider value={context}>
      <section aria-roledescription="carousel" {...props} />
    </Context.Provider>
  );
}
```

## Spec: aria-live

為了不影響用戶在閱讀時一直被插播，  
當自動輪播開啟時，`aria-live` 須為 `off`，  
關閉時，`aria-live` 須為 `polite`。

```tsx
describe("aria-live set to", () => {
  it("off: if the carousel is automatically rotating", () => {
    setup(100);
    expect(
      screen.getByText("Dynamic Europe: Amsterdam, Prague, Berlin")
        .parentElement
    ).toHaveAttribute("aria-live", "off");
  });
  it("polite: if the carousel is NOT automatically rotating", () => {
    setup();
    expect(
      screen.getByText("Dynamic Europe: Amsterdam, Prague, Berlin")
        .parentElement
    ).toHaveAttribute("aria-live", "polite");
  });
});
```

### Solution

這邊透過 `context` 通知子元件，當前是否開啟自動輪播。

```tsx
interface State {
  items_id: string;
  index: number;
  next: () => void;
  prev: () => void;
  auto_rotation: boolean;
}
```

```tsx
export function Carousel(props: CarouselProps) {
  const id = useId();
  const [index, dispatch] = useReducer(reducer, 0);
  const next = () => dispatch("asc");
  const prev = () => dispatch("desc");
  const context = {
    items_id: id + "items",
    index,
    next,
    prev,
    auto_rotation: Boolean(props.interval),
  };

  useEffect(() => {
    if (!props.interval) return;
    const id = setInterval(next, props.interval);
    return () => clearInterval(id);
  }, [props.interval, next]);

  return (
    <Context.Provider value={context}>
      <section aria-roledescription="carousel" {...props} />
    </Context.Provider>
  );
}
```

```tsx
function Items(props: ItemsProps) {
  const context = useCarouselContext(
    `<Carousel.Items /> cannot be rendered outside <Carousel />`
  );

  const items: ReturnType<typeof Item>[] = [];
  Children.forEach(props.children, (element) => {
    if (isValidElement(element) && element.type === Item) {
      items.push(element);
    }
  });

  const defaultItemLabel = (index: number) => `${index + 1} of ${items.length}`;
  const aria_live = context.auto_rotation ? "off" : "polite";
  return (
    <div aria-live={aria_live} id={context.items_id}>
      {items.map((item, index) =>
        cloneElement(item, {
          key: defaultItemLabel(index),
          "aria-label": defaultItemLabel(index),
          hidden:
            circular(0, items.length - 1, context.index) !== index
              ? true
              : undefined,
          ...item.props,
        })
      )}
    </div>
  );
}
```

## Spec: Hover Pause Rotation

當用戶 hover 在輪播上時，要停止自動輪播。  
用戶移出則在重新開始輪播。

```tsx
describe("hover pause rotation", () => {
  it("hovering the mouse over any carousel content pauses automatic rotation", async () => {
    setup(100);
    expect(
      screen.queryByText("Dynamic Europe: Amsterdam, Prague, Berlin")
    ).toBeInTheDocument();
    await user.hover(
      screen.getByText("Dynamic Europe: Amsterdam, Prague, Berlin")
    );
    expect(
      screen.getByText("Dynamic Europe: Amsterdam, Prague, Berlin")
        .parentElement
    ).toHaveAttribute("aria-live", "polite");
  });
  it("automatic rotation resumes when the mouse moves away from the carousel", async () => {
    setup(100);
    expect(
      screen.queryByText("Dynamic Europe: Amsterdam, Prague, Berlin")
    ).toBeInTheDocument();
    await user.hover(
      screen.getByText("Dynamic Europe: Amsterdam, Prague, Berlin")
    );
    expect(
      screen.getByText("Dynamic Europe: Amsterdam, Prague, Berlin")
        .parentElement
    ).toHaveAttribute("aria-live", "polite");
    await user.unhover(
      screen.getByText("Dynamic Europe: Amsterdam, Prague, Berlin")
    );
    expect(
      screen.getByText("Dynamic Europe: Amsterdam, Prague, Berlin")
        .parentElement
    ).toHaveAttribute("aria-live", "off");
  });
});
```

### Solution

需要設置 state 用於控制自動輪播。

```tsx
interface State {
  items_id: string;
  index: number;
  next: () => void;
  prev: () => void;
  auto_rotation: boolean;
}
```

當用戶觸發 `pointerenter` 意即正在 hover，  
`pointerleave` 則 unhover。

```tsx
export function Carousel(props: CarouselProps) {
  const id = useId();
  const [index, dispatch] = useReducer(reducer, 0);
  const next = () => dispatch("asc");
  const prev = () => dispatch("desc");

  const [auto_rotation, set_auto_rotation] = useState(Boolean(props.interval));
  const context = {
    items_id: id + "items",
    index,
    next,
    prev,
    auto_rotation,
  };

  useEffect(() => {
    if (!auto_rotation) return;
    const id = setInterval(next, props.interval);
    return () => clearInterval(id);
  }, [auto_rotation, props.interval, next]);

  const enter = () => Boolean(props.interval) && set_auto_rotation(false);
  const leave = () => set_auto_rotation(Boolean(props.interval));

  return (
    <Context.Provider value={context}>
      <section
        aria-roledescription="carousel"
        onPointerEnter={enter}
        onPointerLeave={leave}
        {...props}
      />
    </Context.Provider>
  );
}
```

## Spec: Focus Pause Rotation

當用戶 focus 在輪播上時，要停止自動輪播。  
用戶移出則在重新開始輪播。

```tsx
describe("focus pause rotation", () => {
  it(
    "moving keyboard focus to any of the carousel content, " +
      "including the next and previous slide elements, pauses automatic rotation",
    async () => {
      setup(100);
      expect(
        screen.getByText("Dynamic Europe: Amsterdam, Prague, Berlin")
          .parentElement
      ).toHaveAttribute("aria-live", "off");
      await user.keyboard("{Tab}");
      expect(
        screen.getByText("Dynamic Europe: Amsterdam, Prague, Berlin")
          .parentElement
      ).toHaveAttribute("aria-live", "polite");
    }
  );
  it("automatic rotation resumes when keyboard focus moves out of the carousel content", async () => {
    setup(100);
    expect(
      screen.getByText("Dynamic Europe: Amsterdam, Prague, Berlin")
        .parentElement
    ).toHaveAttribute("aria-live", "off");
    await user.keyboard("{Tab}");
    expect(
      screen.getByText("Dynamic Europe: Amsterdam, Prague, Berlin")
        .parentElement
    ).toHaveAttribute("aria-live", "polite");
    await user.keyboard("{Shift>}{Tab}{/Shift}");
    expect(
      screen.getByText("Dynamic Europe: Amsterdam, Prague, Berlin")
        .parentElement
    ).toHaveAttribute("aria-live", "off");
  });
});
```

### Solution

當元件觸發 `focus` 則表示元件正在被聚焦。  
`blur` 則表示元件失去焦點。

```tsx
export function Carousel(props: CarouselProps) {
  const id = useId();
  const [index, dispatch] = useReducer(reducer, 0);
  const next = () => dispatch("asc");
  const prev = () => dispatch("desc");

  const [auto_rotation, set_auto_rotation] = useState(Boolean(props.interval));
  const context = {
    items_id: id + "items",
    index,
    next,
    prev,
    auto_rotation,
  };

  useEffect(() => {
    if (!auto_rotation) return;
    const id = setInterval(next, props.interval);
    return () => clearInterval(id);
  }, [auto_rotation, props.interval, next]);

  const enter = () => Boolean(props.interval) && set_auto_rotation(false);
  const leave = () => set_auto_rotation(Boolean(props.interval));

  return (
    <Context.Provider value={context}>
      <section
        aria-roledescription="carousel"
        onPointerEnter={enter}
        onPointerLeave={leave}
        onFocusCapture={enter}
        onBlurCapture={leave}
        {...props}
      />
    </Context.Provider>
  );
}
```

## Spec: hover and focus both execute

除非 hover 跟 focus 兩者都不作用於元件，自動輪播才會被觸發。

```tsx
it("unless another condition, such as keyboard focus, that prevents rotation has been triggered", async () => {
  setup(100);
  expect(
    screen.queryByText("Dynamic Europe: Amsterdam, Prague, Berlin")
  ).toBeInTheDocument();
  await user.hover(
    screen.getByText("Dynamic Europe: Amsterdam, Prague, Berlin")
  );
  expect(
    screen.getByText("Dynamic Europe: Amsterdam, Prague, Berlin").parentElement
  ).toHaveAttribute("aria-live", "polite");
  await user.keyboard("{Tab}");
  await user.unhover(
    screen.getByText("Dynamic Europe: Amsterdam, Prague, Berlin")
  );
  expect(
    screen.getByText("Dynamic Europe: Amsterdam, Prague, Berlin").parentElement
  ).toHaveAttribute("aria-live", "polite");
});

it("unless another condition, such as mouse hover, that prevents rotation has been triggered", async () => {
  setup(100);
  expect(
    screen.getByText("Dynamic Europe: Amsterdam, Prague, Berlin").parentElement
  ).toHaveAttribute("aria-live", "off");
  await user.keyboard("{Tab}");
  expect(
    screen.getByText("Dynamic Europe: Amsterdam, Prague, Berlin").parentElement
  ).toHaveAttribute("aria-live", "polite");
  await user.hover(
    screen.getByText("Dynamic Europe: Amsterdam, Prague, Berlin")
  );
  await user.keyboard("{Shift>}{Tab}{/Shift}");
  expect(
    screen.getByText("Dynamic Europe: Amsterdam, Prague, Berlin").parentElement
  ).toHaveAttribute("aria-live", "polite");
});
```

### Solution

因為自動輪播的狀態判斷從原本的二種可能 (e.g. on / off)，  
變成會有四種可能 (e.g. none / hover / focus / hover + focus)。

我並不想用兩個 state 來追蹤狀態 (e.g. isHover / isFocus)。

這邊示範用一個參數追蹤四種可能的狀態。

首先透過 enum 把狀態列出。
透過 位元操作(bitwise) 我們可以用同一個數值表示複數狀態。

```tsx
enum CarouselState {
  None = 0b0000,
  Hover = 0b0001,
  Focus = 0b0010,
}
```

```tsx
function stateReducer(
  state: CarouselState,
  action: "enter" | "leave" | "focus" | "blur"
) {
  if (action === "enter") return state | CarouselState.Hover;
  if (action === "leave") return state ^ CarouselState.Hover;
  if (action === "focus") return state | CarouselState.Focus;
  if (action === "blur") return state ^ CarouselState.Focus;
  return state;
}
```

為了讓命名可以清楚區分各個 `reducer`，這邊重新命名 `counterReducer`。

```tsx
function counterReducer(counter: number, action: "asc" | "desc") {
  if (action === "asc") return counter + 1;
  if (action === "desc") return counter - 1;
  return counter;
}
```

```tsx
export function Carousel(props: CarouselProps) {
  const id = useId();
  const [index, counterDispatch] = useReducer(counterReducer, 0);
  const next = () => counterDispatch("asc");
  const prev = () => counterDispatch("desc");

  const [state, stateDispatch] = useReducer(stateReducer, CarouselState.None);
  const enter = () => stateDispatch("enter");
  const leave = () => stateDispatch("leave");
  const focus = () => stateDispatch("focus");
  const blur = () => stateDispatch("blur");

  const auto_rotation = state === CarouselState.None && Boolean(props.interval);

  const context = {
    items_id: id + "items",
    index,
    next,
    prev,
    auto_rotation,
  };

  useEffect(() => {
    if (!auto_rotation) return;
    const id = setInterval(next, props.interval);
    return () => clearInterval(id);
  }, [auto_rotation, props.interval, next]);

  return (
    <Context.Provider value={context}>
      <section
        aria-roledescription="carousel"
        onPointerEnter={enter}
        onPointerLeave={leave}
        onFocusCapture={focus}
        onBlurCapture={blur}
        {...props}
      />
    </Context.Provider>
  );
}
```
