---
rule: store-initial-state
category: Store 設計
tags: [reset, initial-state]
---

# 抽離初始 State 常數，`reset` 引用同一來源

> store 初始 state 抽成獨立常數，`reset` action 引用同一份，避免重置邏輯與初始值不同步。

## 原因

- 手動列出每個欄位重設，日後新增欄位時容易漏更新 `reset`。
- `initialState` 常數是單一來源，store 建立與 reset 都引用同一份，不會出現差異。

## ❌ Bad

```ts
export const useFilterStore = create<FilterState>()((set) => ({
  keyword: '',
  status: 'all',
  page: 1,
  actions: {
    // 手動列出每個欄位，日後新增欄位容易漏掉
    reset: () => set({ keyword: '', status: 'all', page: 1 }),
  },
}))
```

`reset` 裡的欄位與初始值分離維護，新增欄位時需同步修改兩處。

## ✅ Good

```ts
type FilterState = {
  keyword: string
  status: 'all' | 'active' | 'inactive'
  page: number
  actions: {
    setKeyword: (keyword: string) => void
    reset: () => void
  }
}

const initialState = {
  keyword: '',
  status: 'all' as const,
  page: 1,
}

export const useFilterStore = create<FilterState>()((set) => ({
  ...initialState,
  actions: {
    setKeyword: (keyword) => set({ keyword }),
    reset: () => set(initialState),
  },
}))
```

單一來源維護初始值，新增欄位只需更新 `initialState`，`reset` 自動覆蓋。
