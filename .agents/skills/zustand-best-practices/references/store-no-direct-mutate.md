---
rule: store-no-direct-mutate
category: Store 設計
tags: [immutable, immer, mutation]
---

# `set()` 內回傳新物件，禁止直接 Mutate State

> `set()` callback 必須回傳新物件，直接 mutate state 不改變 reference，Zustand 偵測不到變化，元件不會 re-render。

## 原因

- Zustand 用 `Object.is` 比較前後值，直接 mutate 後 reference 不變，視為沒有變化，selector 不更新。
- 巢狀物件展開語法繁瑣時，引入 `immer` middleware 可寫 mutable 語法但自動產生新物件。
- Immer 是官方明確支援的 middleware，不是 workaround。

## ❌ Bad

```ts
export const useTodoStore = create<TodoState>()((set) => ({
  todos: [{ id: '1', text: 'Buy milk', done: false }],
  actions: {
    toggleTodo: (id) =>
      set((state) => {
        // 直接 mutate，reference 不變，元件不 re-render
        const target = state.todos.find((todo) => todo.id === id)
        if (target) target.done = !target.done
        return state
      }),
  },
}))
```

直接修改 `state.todos` 內的物件並回傳同一個 `state`，`Object.is` 比較結果相同，訂閱此 slice 的元件不會更新。

## ✅ Good

```ts
// 方案 A：回傳新物件（shallow clone）
export const useTodoStore = create<TodoState>()((set) => ({
  todos: [{ id: '1', text: 'Buy milk', done: false }],
  actions: {
    toggleTodo: (id) =>
      set((state) => ({
        todos: state.todos.map((todo) =>
          todo.id === id ? { ...todo, done: !todo.done } : todo,
        ),
      })),
  },
}))

// 方案 B：巢狀結構複雜時用 immer middleware
import { immer } from 'zustand/middleware/immer'

export const useTodoStore = create<TodoState>()(
  immer((set) => ({
    todos: [{ id: '1', text: 'Buy milk', done: false }],
    actions: {
      toggleTodo: (id) =>
        set((state) => {
          const target = state.todos.find((todo) => todo.id === id)
          if (target) target.done = !target.done
        }),
    },
  })),
)
```

方案 A 透過 `map` 回傳新陣列，reference 改變，selector 正確觸發更新。方案 B 用 immer 讓 mutable 寫法自動產生新物件，適合深層巢狀結構。
