# 如何製作輪播 carousel 4【 carousel | 我不會寫 React Component 】

本篇接續前篇 [如何製作輪播 carousel 3【 carousel | 我不會寫 React Component 】](./carousel-3.md)  
可以先看完上一篇再接續此篇。

## Spec: Button for stop and start automatic rotation

須配有開啟/關閉自動輪播的按鈕。

```tsx
describe("button for stop and start automatic rotation", () => {
  it(
    "the carousel also contains a rotation control button " +
      "that can stop and start automatic rotation",
    async () => {
      setup(100);
      expect(
        screen.getByText("Dynamic Europe: Amsterdam, Prague, Berlin")
          .parentElement
      ).toHaveAttribute("aria-live", "off");
      await user.click(screen.getByText("pause auto-rotation"));
      expect(
        screen.getByText("Dynamic Europe: Amsterdam, Prague, Berlin")
          .parentElement
      ).toHaveAttribute("aria-live", "polite");
      await user.click(screen.getByText("start auto-rotation"));
      await user.keyboard("{Shift>}{Tab}{/Shift}");
      await user.unhover(screen.getByText("start auto-rotation"));
      expect(
        screen.getByText("Dynamic Europe: Amsterdam, Prague, Berlin")
          .parentElement
      ).toHaveAttribute("aria-live", "off");
    }
  );
});
```

### Solution

透過 `action="toggle"` 讓按鈕可以控制自動輪播，  
且開啟跟關閉自動輪播時，會同步更新按鈕的文字。

```tsx
function setup(interval?: number) {
  user.setup();
  render(
    <Carousel aria-label="Highlighted television shows" interval={interval}>
      <Carousel.Button action="toggle">
        {(auto_rotation) =>
          auto_rotation ? "pause auto-rotation" : "start auto-rotation"
        }
      </Carousel.Button>
      <Carousel.Button action="next">next slide</Carousel.Button>
      <Carousel.Button action="prev">previous slide</Carousel.Button>
      <Carousel.Items>
        <Carousel.Item>Dynamic Europe: Amsterdam, Prague, Berlin</Carousel.Item>
        <Carousel.Item>Travel to Southwest England and Paris</Carousel.Item>
        <Carousel.Item>Great Children's Programming on Public TV</Carousel.Item>
        <Carousel.Item>Foyle’s War Revisited</Carousel.Item>
        <Carousel.Item>Great Britain Vote: 7 pm Sat.</Carousel.Item>
        <Carousel.Item>Mid-American Gardener: Thursdays at 7 pm</Carousel.Item>
      </Carousel.Items>
    </Carousel>
  );
}
```

`context` 增加可以控制自動輪播的函式。

```tsx
interface State {
  items_id: string;
  index: number;
  next: () => void;
  prev: () => void;
  pause: () => void;
  start: () => void;
  auto_rotation: boolean;
}
```

按鈕增加新的 `action` `toggle` 用於控制自動輪播開關。  
同時提供 [Render Props][renderprops] 讓用戶可以根據當前開關狀態控制顯示文字。

```tsx
type ButtonAction = "next" | "prev" | "toggle";
type ButtonProps = PCP<
  "button",
  {
    action?: ButtonAction;
    children: ((auto_rotation: boolean) => ReactNode) | ReactNode;
  }
>;
function Button(props: ButtonProps) {
  const context = useCarouselContext(
    `<Carousel.Button /> cannot be rendered outside <Carousel />`
  );
  const onClick = () => {
    if (props.action === "next") return context.next();
    if (props.action === "prev") return context.prev();
    if (props.action === "toggle")
      return context.auto_rotation ? context.pause() : context.start();
  };

  const children = (() => {
    if (typeof props.children === "function") {
      return props.children(context.auto_rotation);
    }
    return props.children;
  })();

  return (
    <button
      type="button"
      aria-controls={context.items_id}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
}
```

增加一個新的狀態 `Pause` 用於表示暫停狀態，  
當暫停狀態結束，應當回復到前一狀態 (e.g. hover / focus 等等)。

```tsx
enum CarouselState {
  None = 0b0000,
  Hover = 0b0001,
  Focus = 0b0010,
  Pause = 0b0100,
}
```

```tsx
function stateReducer(
  state: CarouselState,
  action: "enter" | "leave" | "focus" | "blur" | "pause" | "start"
) {
  if (action === "enter") return state | CarouselState.Hover;
  if (action === "leave") return state ^ CarouselState.Hover;
  if (action === "focus") return state | CarouselState.Focus;
  if (action === "blur") return state ^ CarouselState.Focus;
  if (action === "pause") return state | CarouselState.Pause;
  if (action === "start") return state ^ CarouselState.Pause;
  return state;
}
```

透過 `contain` 判斷是否包含特定 bit。

```tsx
const contain = (x: number, y: number) => (x & y) === x;
```

當前狀態包含 `Pause` 則直接關閉自動輪播。

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
  const pause = () => stateDispatch("pause");
  const start = () => stateDispatch("start");

  const auto_rotation = (() => {
    if (contain(CarouselState.Pause, state)) return false;

    return state === CarouselState.None && Boolean(props.interval);
  })();

  const context = {
    items_id: id + "items",
    index,
    next,
    prev,
    pause,
    start,
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

## Spec: Keyboard Support

按鍵支援。

```tsx
describe("keyboard support", () => {
  describe("tab", () => {
    it("moves focus through interactive elements in the carousel", async () => {
      setup(100);
      await user.keyboard("{Tab}");
      expect(screen.getByText("start auto-rotation")).toHaveFocus();
      await user.keyboard("{Tab}");
      expect(screen.getByText("next slide")).toHaveFocus();
      await user.keyboard("{Tab}");
      expect(screen.getByText("previous slide")).toHaveFocus();
    });
  });
  describe("enter", () => {
    it("display next slide in the carousel", async () => {
      setup();
      await user.keyboard("{Tab}");
      await user.keyboard("{Tab}");
      expect(screen.getByRole("group")).toHaveAccessibleName("1 of 6");
      await user.keyboard("{Enter}");
      expect(screen.getByRole("group")).toHaveAccessibleName("2 of 6");
      await user.keyboard("{Enter}");
      expect(screen.getByRole("group")).toHaveAccessibleName("3 of 6");
      await user.keyboard("{Enter}");
      expect(screen.getByRole("group")).toHaveAccessibleName("4 of 6");
      await user.keyboard("{Enter}");
      expect(screen.getByRole("group")).toHaveAccessibleName("5 of 6");
      await user.keyboard("{Enter}");
      expect(screen.getByRole("group")).toHaveAccessibleName("6 of 6");
      await user.keyboard("{Enter}");
      expect(screen.getByRole("group")).toHaveAccessibleName("1 of 6");
    });
    it("display previous slide in the carousel", async () => {
      setup();
      await user.keyboard("{Tab}");
      await user.keyboard("{Tab}");
      await user.keyboard("{Tab}");
      expect(screen.getByRole("group")).toHaveAccessibleName("1 of 6");
      await user.keyboard("{Enter}");
      expect(screen.getByRole("group")).toHaveAccessibleName("6 of 6");
      await user.keyboard("{Enter}");
      expect(screen.getByRole("group")).toHaveAccessibleName("5 of 6");
      await user.keyboard("{Enter}");
      expect(screen.getByRole("group")).toHaveAccessibleName("4 of 6");
      await user.keyboard("{Enter}");
      expect(screen.getByRole("group")).toHaveAccessibleName("3 of 6");
      await user.keyboard("{Enter}");
      expect(screen.getByRole("group")).toHaveAccessibleName("2 of 6");
      await user.keyboard("{Enter}");
      expect(screen.getByRole("group")).toHaveAccessibleName("1 of 6");
    });
  });
  describe("space", () => {
    it("display next slide in the carousel", async () => {
      setup();
      await user.keyboard("{Tab}");
      await user.keyboard("{Tab}");
      expect(screen.getByRole("group")).toHaveAccessibleName("1 of 6");
      await user.keyboard("{Space}");
      expect(screen.getByRole("group")).toHaveAccessibleName("2 of 6");
      await user.keyboard("{Space}");
      expect(screen.getByRole("group")).toHaveAccessibleName("3 of 6");
      await user.keyboard("{Space}");
      expect(screen.getByRole("group")).toHaveAccessibleName("4 of 6");
      await user.keyboard("{Space}");
      expect(screen.getByRole("group")).toHaveAccessibleName("5 of 6");
      await user.keyboard("{Space}");
      expect(screen.getByRole("group")).toHaveAccessibleName("6 of 6");
      await user.keyboard("{Space}");
      expect(screen.getByRole("group")).toHaveAccessibleName("1 of 6");
    });
    it("display previous slide in the carousel", async () => {
      setup();
      await user.keyboard("{Tab}");
      await user.keyboard("{Tab}");
      await user.keyboard("{Tab}");
      expect(screen.getByRole("group")).toHaveAccessibleName("1 of 6");
      await user.keyboard("{Space}");
      expect(screen.getByRole("group")).toHaveAccessibleName("6 of 6");
      await user.keyboard("{Space}");
      expect(screen.getByRole("group")).toHaveAccessibleName("5 of 6");
      await user.keyboard("{Space}");
      expect(screen.getByRole("group")).toHaveAccessibleName("4 of 6");
      await user.keyboard("{Space}");
      expect(screen.getByRole("group")).toHaveAccessibleName("3 of 6");
      await user.keyboard("{Space}");
      expect(screen.getByRole("group")).toHaveAccessibleName("2 of 6");
      await user.keyboard("{Space}");
      expect(screen.getByRole("group")).toHaveAccessibleName("1 of 6");
    });
  });
});
```

### Solution

```tsx
function Button(props: ButtonProps) {
  const context = useCarouselContext(
    `<Carousel.Button /> cannot be rendered outside <Carousel />`
  );
  const onClick = () => {
    if (props.action === "next") return context.next();
    if (props.action === "prev") return context.prev();
    if (props.action === "toggle")
      return context.auto_rotation ? context.pause() : context.start();
  };

  const children = (() => {
    if (typeof props.children === "function") {
      return props.children(context.auto_rotation);
    }
    return props.children;
  })();

  const ref = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const keydown = (event: KeyboardEvent) => {
      if (ref.current !== document.activeElement) return;

      if (event.key === "Space") {
        onClick();
      }
    };
    window.addEventListener("keydown", keydown);
    return () => window.removeEventListener("keydown", keydown);
  }, [onClick]);

  return (
    <button
      ref={ref}
      type="button"
      aria-controls={context.items_id}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
}
```

[renderprops]: https://reactjs.org/docs/render-props.html
