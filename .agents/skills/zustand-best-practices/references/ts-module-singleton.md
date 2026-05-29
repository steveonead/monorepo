---
rule: ts-module-singleton
category: TypeScript
tags: [typescript, singleton, module-level, create]
---

# Store 必須在 Module Top-Level 宣告

> 禁止在元件或 hook 內呼叫 `create()`，每次 render 都會建立新 store 實例，state 永遠回到初始值。

## 原因

- 在元件內呼叫 `create()` 會隨每次 render 產生全新 store，state 無法累積
- 新 store 的訂閱與 action 全部失效，整個狀態管理形同虛設
- Module-level singleton 確保 store 在整個 app 生命週期內只建立一次

## ❌ Bad

```ts
function Counter() {
  const useCounterStore = create<{ count: number }>()(set => ({
    count: 0,
    inc: () => set(state => ({ count: state.count + 1 })),
  }))
  const count = useCounterStore(state => state.count)
  // ...
}
```

每次 render 重建 store，`count` 永遠是 `0`，點擊 `inc` 無效果。

## ✅ Good

```ts
// stores/use-counter-store.ts
type CounterStore = { count: number; actions: { inc: () => void } }

export const useCounterStore = create<CounterStore>()((set) => ({
  count: 0,
  actions: {
    inc: () => set(state => ({ count: state.count + 1 })),
  },
}))
```

Module-level singleton，state 在整個 app 生命週期內共享，訂閱與 action 正常運作。
