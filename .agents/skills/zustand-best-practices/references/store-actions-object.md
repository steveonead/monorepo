---
rule: store-actions-object
category: Store 設計
tags: [actions, selector, re-render]
---

# 將所有 Action 集中在 `actions` 物件

> 所有 action 定義在 store 的 `actions` 物件內，元件只透過 `state => state.actions` 取用。

## 原因

- `actions` 物件的 reference 在 store 生命週期內固定，訂閱 `state => state.actions` 不會因 state 更新觸發 re-render。
- action 集中管理，store 結構一目了然，也與社群慣例（tkdodo 等）對齊。
- 元件端呼叫方式一致，不需逐一解構個別 action。

## ❌ Bad

```ts
export const useCounterStore = create<CounterState>()((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
  reset: () => set({ count: 0 }),
}))

// 元件內
const increment = useCounterStore((state) => state.increment)
const decrement = useCounterStore((state) => state.decrement)
```

Actions 散落在 store 根層，元件必須逐一訂閱，每個 action selector 都是獨立訂閱，增加維護成本。

## ✅ Good

```ts
type CounterState = {
  count: number
  actions: {
    increment: () => void
    decrement: () => void
    reset: () => void
  }
}

export const useCounterStore = create<CounterState>()((set) => ({
  count: 0,
  actions: {
    increment: () => set((state) => ({ count: state.count + 1 })),
    decrement: () => set((state) => ({ count: state.count - 1 })),
    reset: () => set({ count: 0 }),
  },
}))

export function useCounterStoreActions() {
  return useCounterStore(state => state.actions);
}

// 元件內
const { increment, decrement, reset } = useCounterStoreActions()
```

`actions` reference 穩定，單一訂閱即可取得全部 action，元件不會因 state 變動而重繪。
