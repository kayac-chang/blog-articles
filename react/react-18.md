# React 18

## Install

Currently, React 18 is available in Release Candidate (RC).

```bash
npm install react@rc react-dom@rc
```

Or if you're using yarn:

```bash
yarn add react@rc react-dom@rc
```

## Update Rendering API

React 18 introduces a new root API
which provides better ergonomics for managing roots.

The new root API also enables the new concurrent renderer,
which allows you to opt-into concurrent features.

```javascript
import { createRoot } from "react-dom/client";
const container = document.getElementById("app");
const root = createRoot(container);
root.render(<App tab="home" />);
```

changed `unmountComponentAtNode` to `root.unmount`

```javascript
root.unmount();
```

remove the callback from render

```javascript
function AppWithCallbackAfterRender() {
  useEffect(() => {
    console.log("rendered");
  });

  return <App tab="home" />;
}
```

if you using server-side rendering with hydration

```javascript
import { hydrateRoot } from "react-dom/client";
const container = document.getElementById("app");
const root = hydrateRoot(container, <App tab="home" />);
```

## Update to Server Rendering APIs

React 18 is highly focus on server-side rendering,
they revamping `react-dom/server` APIs
to fully support Suspense on the server and Streaming SSR.

They deprecating the old Node streaming API,

- `renderToNodeStream`: Deprecated

Instead, using

- `renderToPipeableStream`: New

And also introducing a new API to support streaming SSR
for modern edge runtime environment, such as Deno and Cloudflare workers:

- `renderToReadableStream`: New

The following API still working, but limited support for Suspense:

- `renderToString`: Limited
- `renderToStaticMarkup`: Limited

Finally, API for rendering e-mails still work:

- `renderToStaticNodeStream`

## Automatic Batching

React 18 adds batching by default.
Batching is when React groups multiple state updates
into a single re-render for better performance.

Before 18, we only batched update inside React event handlers.
update inside promises, setTimeout, native event handlers
will not batched in React by default.

```javascript
// Before React 18 only React events were batched

function handleClick() {
  setCount((c) => c + 1);
  setFlag((f) => !f);
  // React will only re-render once at the end (that's batching!)
}

setTimeout(() => {
  setCount((c) => c + 1);
  setFlag((f) => !f);
  // React will render twice, once for each state update (no batching)
}, 1000);
```

with `createRoot`, all updates will be automatically batched,
no matter where they originate from.

```javascript
// After React 18 updates inside of timeouts, promises,
// native event handlers or any other event are batched.

function handleClick() {
  setCount((c) => c + 1);
  setFlag((f) => !f);
  // React will only re-render once at the end (that's batching!)
}

setTimeout(() => {
  setCount((c) => c + 1);
  setFlag((f) => !f);
  // React will only re-render once at the end (that's batching!)
}, 1000);
```

## New APIs for Libraries

- `useId`
  is a new hook for generating unique IDs on both client and server,
  while avoiding hydration mismatches.
  this even more important because of streaming server render delivers HTML out-of-order.

- `useSyncExternalStore`
  is a new hook that allows external stores to support concurrent reads
  by forcing updates to the store to be synchronous.
  This new API is for library author.

- `useInsertionEffect`
  is a new hook for CSS-in-JS lib to address performance issues.

- `startTransition`

- `useDeferredValue`

## Updates to Strict Mode

In the future, react like to add a feature that allows React
to add and remove sections of the UI
while preserving state.

For example,
when a user tabs away from a screen and back,
React should be able to immediately show the previous screen.
To do this,
React would unmount and remount trees
using the same component state as before.

This feature requries components mounted and destroyed multiple times.
Most effects will work without any changes,
but some effects assume they are only mounted or destroyed once.

To help surface this issues,
they introduce a new development-only check to Strict Mode.
This check will automatically unmount and remount every component,
whenever a component mounts for the first time,
restoring the previous state on the second mount.
