---
rule: perf-selector-subscription
category: 效能
tags: [selector, subscription, custom-hook, re-render]
---

# 用 Selector 精準訂閱，封裝成 Custom Selector Hook

> 禁止直接 `useStore()` 訂閱整個 store，必須用 selector 精準取值，並封裝成 custom hook。

## 原因

- Zustand 預設用 `===` 比較 selector 回傳值，不加 selector 時任一欄位變動都觸發 re-render。
- 封裝成 custom hook 可隱藏 store 內部結構，schema 改變只需改 hook，元件不感知。

## ❌ Bad

```ts
function Counter() {
  const store = useCounterStore();
  return <div>{store.count}</div>;
}
```

訂閱整個 store，`actions` 或其他欄位變動時元件也會 re-render，造成不必要的渲染。

## ✅ Good

```ts
// store/counter.selectors.ts
export function useCount() { return useCounterStore(state => state.count) }
export function useCounterActions() { return useCounterStore(state => state.actions) }

// Counter.tsx
function Counter() {
  const count = useCount();
  return <div>{count}</div>;
}
```

selector 只訂閱需要的欄位，`actions` 物件通常是 stable reference，亦可安全獨立訂閱。

## 例外

測試或 Storybook 的 mock store 情境，可直接存取整個 store 以便注入初始狀態，不需封裝 selector hook。
