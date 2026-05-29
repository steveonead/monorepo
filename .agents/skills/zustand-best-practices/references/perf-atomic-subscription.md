---
rule: perf-atomic-subscription
category: 效能
tags: [subscription, useShallow, atomic, primitive, infinite-loop]
---

# 多個 Primitive 值各自獨立匯出 hook，需要物件時才包 `useShallow`

> 預設在 `store.ts` 各自匯出獨立 selector hook，只在必須回傳物件時才包 `useShallow`。

## 原因

- v5 改用 `useSyncExternalStore`，以 `Object.is` 比較 snapshot。inline 建立的 `{}` 或 `[]` 每次 render 都是新 reference，觸發 infinite loop。
- 多個 primitive 各自訂閱，單一值改變時只有相關元件 re-render，互不干擾。

## ❌ Bad（Inline 物件導致 Infinite Loop）

```ts
// component.tsx
const profile = useUserStore(state => ({ name: state.name, email: state.email }));
```

Inline 物件每次 render 都是新 reference，觸發 `The result of getSnapshot should be cached to avoid an infinite loop` 錯誤。

## ✅ Good（預設：各自獨立匯出 hook）

```ts
// store.ts
export function useUserName() { return useUserStore(state => state.name); }
export function useUserEmail() { return useUserStore(state => state.email); }
```

兩個 hook 各自獨立，`name` 改變時只有依賴 `name` 的元件 re-render，互不干擾。

## ✅ Good（必須回傳物件時）

```ts
// store.ts
import { useShallow } from 'zustand/react/shallow';

export function useUserProfile() {
  return useUserStore(useShallow(state => ({ name: state.name, email: state.email })));
}
```

`useShallow` 內部快取上次結果，內容 shallow-equal 時回傳同一 reference，值真正改變才觸發 re-render。

