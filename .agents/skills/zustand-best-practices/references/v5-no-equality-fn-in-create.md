---
rule: v5-no-equality-fn-in-create
category: v5 升級
tags: [v5, migration, create, equality-fn]
---

# `create()` 不再接受 equalityFn 參數

> v5 移除了 `create()` 的第二個 equality 參數，需要自訂 equality 時改用 `createWithEqualityFn`（位於 `zustand/traditional`）。

## 原因

- v5 簡化核心 API，將自訂 equality 的能力獨立到 `createWithEqualityFn`
- 多數情境用 `useShallow` 即可達到一樣的效果，不需要 store 層級的全域 equality
- 確實需要 store 層級 equality 的場景（例如多個 selector 都要 shallow 比較），才使用 `createWithEqualityFn`

## ❌ Bad

```ts
import { create } from 'zustand';
import { shallow } from 'zustand/shallow';

// v4 寫法：在 create 第二個參數傳 shallow
// v5 已移除這個參數，型別會錯且 equality 不會生效
const useStore = create<Store>(
  (set) => ({
    /* ... */
  }),
  shallow,
);
```

從 v4 升級的程式碼會在此產生型別錯誤，或 equality 被靜默移除，selector 比較退回預設的 `Object.is`。

## ✅ Good — 預設用 `useShallow`

```ts
import { create } from 'zustand';
import { useShallow } from 'zustand/react/shallow';

const useStore = create<Store>()((set) => ({
  /* ... */
}));

export function useProfile() {
  return useStore(
    useShallow((state) => ({ name: state.name, email: state.email })),
  );
}
```

把 equality 的選擇從 store 層下放到 selector 層，更精準，也避免全局比較邏輯。

## ✅ Good — 需要 store 層級 equality 時

```ts
import { createWithEqualityFn } from 'zustand/traditional';
import { shallow } from 'zustand/shallow';

const useStore = createWithEqualityFn<Store>()(
  (set) => ({
    /* ... */
  }),
  shallow,
);
```

`createWithEqualityFn` 才是 v5 提供「store 層 equality」的正規入口。注意：只有 `zustand/traditional` 這條入口需要額外安裝 `use-sync-external-store`（v5 將它改為 peer dependency），預設的 `create` 不需要。selector 回傳穩定 reference 的細節，見 `v5-stable-selector-output`。
