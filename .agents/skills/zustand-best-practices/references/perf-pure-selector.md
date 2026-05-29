---
rule: perf-pure-selector
category: 效能
tags: [selector, useMemo, derived-state, re-render]
---

# Selector 只取原始 State 值，轉換邏輯放外部 Hook 層

> Selector 只取原始值，轉換邏輯移到外部 hook 以 `useMemo` 固定引用；或加 `'use memo'` 由 Compiler 接管

## 原因

- Selector 內做 `.map` 每次 render 都回傳新陣列，Zustand 用 `===` 比較結果，每次都視為「值改變」，持續觸發 re-render。
- 把轉換邏輯移到 hook 層並用 `useMemo`，可確保只在來源陣列變動時才重新計算。

## ❌ Bad

```ts
export function usePetNames() {
  return useStore(state => state.pets.map(pet => pet.name));
}
```

每次呼叫 `usePetNames` 都產生新陣列，即使 `pets` 沒有變動，元件也會 re-render。

## ✅ Good

```ts
function usePets() {
  return useStore(state => state.pets);
}

export function usePetNames() {
  const pets = usePets();
  return useMemo(() => pets.map(pet => pet.name), [pets]);
}
```

`usePets` 訂閱原始陣列 reference，`useMemo` 只在 `pets` reference 變動時重新計算，避免多餘 re-render。

## 例外

- 衍生值是 primitive（如 `pets.length`），直接在 selector 計算沒有 reference 問題。
- hook 加 `'use memo'`，Compiler 自動處理，不需手動 `useMemo`：

```ts
export function usePetNames() {
  "use memo"
  const pets = useStore(state => state.pets)
  return pets.map(pet => pet.name)
}
```
