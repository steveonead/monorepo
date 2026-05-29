---
rule: store-derived-selector
category: Store 設計
tags: [derived-state, selector, computed]
---

# 可推導的值用 Selector 計算，不存入 Store

> 可由現有 state 推導的值（總數、篩選後清單、boolean flag）用 selector 即時計算，不存入 store 欄位。

## 原因

- 存入 store 的衍生值需要每個 setter 都同步更新，容易出現不一致。
- Selector 在 render 時即時計算，來源永遠是最新的 state，無同步問題。
- Store 只保留最小必要 state，結構更精簡，也更容易測試。

## ❌ Bad

```ts
type FilterState = {
  keyword: string
  status: 'all' | 'active' | 'inactive'
  // 衍生值存入 store
  hasActiveFilter: boolean
  actions: {
    setKeyword: (keyword: string) => void
    setStatus: (status: FilterState['status']) => void
  }
}

export const useFilterStore = create<FilterState>()((set) => ({
  keyword: '',
  status: 'all',
  hasActiveFilter: false,
  actions: {
    // 每個 setter 都要記得更新 hasActiveFilter
    setKeyword: (keyword) =>
      set((state) => ({ keyword, hasActiveFilter: !!keyword || state.status !== 'all' })),
    setStatus: (status) =>
      set((state) => ({ status, hasActiveFilter: !!state.keyword || status !== 'all' })),
  },
}))
```

衍生值分散在每個 setter 中手動同步，日後新增篩選條件時容易漏掉某個更新點。

## ✅ Good

```ts
type FilterState = {
  keyword: string
  status: 'all' | 'active' | 'inactive'
  actions: {
    setKeyword: (keyword: string) => void
    setStatus: (status: FilterState['status']) => void
  }
}

export const useFilterStore = create<FilterState>()((set) => ({
  keyword: '',
  status: 'all',
  actions: {
    setKeyword: (keyword) => set({ keyword }),
    setStatus: (status) => set({ status }),
  },
}))

// 衍生 primitive 直接在 selector 計算
export function useHasActiveFilter() {
  return useFilterStore((state) => state.keyword !== '' || state.status !== 'all')
}
```

Store 只存最小原始 state，衍生值在讀取時計算，永遠與來源保持一致。
