---
rule: store-module-level-actions
category: Store 設計
tags: [store, actions, non-react]
---

# 在 React 外呼叫 action 改用 module-level function

> 需要在 React 元件外（router loader、utility function、event handler 內的非 React 程式碼）改 state 時，使用 module-level function 而非透過 hook。

## 原因

- Store 上的 `actions` 物件必須透過 hook 取得，hook 只能在 React 元件內呼叫
- Module-level function 是普通 function，可在任何地方執行
- 兩種寫法並存：React 元件內透過 `actions` 物件、React 外直接呼叫 module-level function，分工清楚

## ❌ Bad

```ts
import { createFileRoute } from '@tanstack/react-router';
import { useStore } from './store';

export const Route = createFileRoute('/counter')({
  loader: () => {
    // loader 不是 React 元件，無法呼叫 hook 拿到 actions
    const { inc } = useStore((state) => state.actions); // 執行時拋錯
    inc();
  },
});
```

Loader、middleware、CLI script 皆不在 React 渲染樹內，在此呼叫 hook 會拋出錯誤。

## ✅ Good

```ts
import { create } from 'zustand';

type Store = {
  count: number;
};

export const useStore = create<Store>()(() => ({
  count: 0,
}));

// Module-level action：純 function，不依賴 hook
export function inc() {
  useStore.setState((state) => ({ count: state.count + 1 }));
}
```

```ts
import { createFileRoute } from '@tanstack/react-router';
import { inc } from './store';

export const Route = createFileRoute('/counter')({
  loader: () => {
    inc(); // 直接呼叫，不需要 hook
  },
});
```

React 內仍透過 `actions` 物件操作（見 `store-actions-object`），React 外則呼叫 module-level function。`store-actions-object` 說「元件不直接 `setState`」針對的是元件內部；這裡的 module function 不在 render 樹內，直接 `useStore.setState` 反而是正解。
