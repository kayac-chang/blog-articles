# How does react actually work

## The concepts behinds react

- reconciliation
- virtual DOM
- rending
- diffing algorithm

## First - basic concepts understand

- React components
- React elements
- Component instances

### React elements

Simple React component that returns React elements.

```javascript
const App = () => {
  return <div>App component</div>;
};
```

the real return value

```javascript
{
  "$$typeof": Symbol(react.element),
  key: null,
  props: { children: "App component" },
  ref: null,
  type: "div"
}
```

check by yourself

```javascript
console.log(App());
```

- The JSX gets converted to `React.createElement` function calls.
- Each of those functions returns an object similar to the object above.

> Why isn't key and ref part of the props?
> they are special property, will discuss in the future

> What is the $$typeof property?
> just a security measure

### React component

React component is a class or function that outputs an _element tree_.

- if it is a function, the output is the return value of the function
- if it is a class, the output is the return value of the render method.

They also can received an input called props.

#### The tricky part

Previous example, we call component by this way

```javascript
console.log(App());
```

But, we usually call component in this way

```javascript
console.log(<App />);
```

When we render component in JSX, React calling it behind the scenes.

- if it is a function, React calls it directly with the assigned props.
- if it is a function, React create new instance of class and call its render method.

So, not only can React element describe a DOM node (HTML element),
they can also describe a component instance.

### Component Instance

When a React element describes a component,
React keep track of this component by create an instance of it.

Each instance has lifecycle and internal state.

Not only React call our component,
it also manage the instance of it.
