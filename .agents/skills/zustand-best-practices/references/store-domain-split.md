---
rule: store-domain-split
category: Store 設計
tags: [domain, split, naming]
---

# 依 Domain 邊界拆分 Store

> 依 domain 邊界建立獨立 store，命名統一為 `use[Domain]Store`，禁止將不相關 domain 集中在單一巨型 store。

## 原因

- 巨型 store 導致任何 state 變動都可能影響無關元件，難以追蹤訂閱範圍。
- Domain 獨立後，各 store 可單獨測試，依賴關係清晰，也更容易 code splitting。
- 統一命名規範讓團隊一眼識別 store 職責，減少命名爭議。

## ❌ Bad

```ts
// 單一 store 混入多個不相關 domain
export const useAppStore = create<AppState>()((set) => ({
  // UI 偏好
  sidebarOpen: false,
  theme: 'light',
  // 篩選條件
  keyword: '',
  status: 'all',
  // 認證
  currentUser: null,
  token: null,
  // Modal
  activeModal: null,
  actions: { /* 所有 action 混在一起 */ },
}))
```

不同 domain 的 state 耦合在一起，任一 domain 變動都會讓訂閱其他欄位的元件重新計算 selector。

## ✅ Good

```ts
// stores/ui-store.ts
export const useUIStore = create<UIState>()((set) => ({
  sidebarOpen: false,
  theme: 'light' as const,
  actions: {
    toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
    setTheme: (theme) => set({ theme }),
  },
}))

// stores/user-filter-store.ts
export const useUserFilterStore = create<UserFilterState>()((set) => ({
  keyword: '',
  status: 'all' as const,
  actions: {
    setKeyword: (keyword) => set({ keyword }),
    setStatus: (status) => set({ status }),
  },
}))

// stores/auth-store.ts
export const useAuthStore = create<AuthState>()((set) => ({
  currentUser: null,
  token: null,
  actions: {
    setAuth: (user, token) => set({ currentUser: user, token }),
    logout: () => set({ currentUser: null, token: null }),
  },
}))
```

各 store 職責單一，元件只訂閱需要的 domain，互不影響。
