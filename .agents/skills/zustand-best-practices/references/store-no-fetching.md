---
rule: store-no-fetching
category: Store 設計
tags: [server-state, tanstack-query, client-state]
---

# Zustand 只管 Client State，Server State 交給 TanStack Query

> Zustand 負責 UI 偏好、modal 狀態、暫時性 client state；資料 fetching、快取、loading/error 狀態由 TanStack Query 管理。

## 原因

- 在 Zustand 自行實作 loading/error/refetch 邏輯，等於重造 TanStack Query 已解決的問題。
- Server state 有額外需求（背景更新、stale time、deduplication），Zustand 不具備這些能力。
- 兩者職責清晰，debug 更容易，也不會出現快取與 store 資料不同步的問題。

## ❌ Bad

```ts
type UserState = {
  users: User[]
  isLoading: boolean
  error: string | null
  actions: {
    fetchUsers: () => Promise<void>
  }
}

export const useUserStore = create<UserState>()((set) => ({
  users: [],
  isLoading: false,
  error: null,
  actions: {
    fetchUsers: async () => {
      set({ isLoading: true, error: null })
      try {
        const users = await api.getUsers()
        set({ users, isLoading: false })
      } catch (e) {
        set({ error: String(e), isLoading: false })
      }
    },
  },
}))
```

手動管理 loading、error、資料三種狀態，且缺乏快取、deduplication、背景重新整理等能力。

## ✅ Good

```ts
// Zustand 只管 UI state
type UserUIState = {
  selectedUserId: string | null
  actions: {
    selectUser: (id: string | null) => void
  }
}

export const useUserUIStore = create<UserUIState>()((set) => ({
  selectedUserId: null,
  actions: {
    selectUser: (id) => set({ selectedUserId: id }),
  },
}))

// Server state 交給 TanStack Query
export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: api.getUsers,
  })
}

// 元件內
const { data: users, isLoading } = useUsers()
const selectedUserId = useUserUIStore((state) => state.selectedUserId)
const actions = useUserUIStore((state) => state.actions)
```

職責分離明確，TanStack Query 自動處理快取與狀態，Zustand 只維護 UI 邏輯。
