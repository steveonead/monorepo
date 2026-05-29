---
rule: store-module-level-action
category: Store 設計
tags: [module-level, router, loader, no-hook]
---

# React 元件外使用 Module-Level Function 呼叫 Action

> React 元件外（router loader、utility function）無法呼叫 hook，改用 module-level function 直接操作 `setState`。

## 原因

- Hook 只能在 React 元件或自訂 hook 內呼叫，router loader 等脫離 React tree 的地方不能用 hook。
- Zustand store instance 是 module singleton，可在任意模組直接存取 `setState`。
- 此模式也有助於 code splitting，action 邏輯與元件解耦。

## ❌ Bad

```ts
// router/loader.ts
export async function loader() {
  // 錯誤：hook 不能在 React 元件外呼叫
  const setUser = useAuthStore((state) => state.actions.setUser)
  const user = await fetchUser()
  setUser(user)
}
```

在 loader 呼叫 hook 會在 runtime 拋出 hook rules 違規錯誤，且 linter 也會標記。

## ✅ Good

```ts
// stores/auth-store.ts
type AuthState = {
  user: User | null
  actions: {
    setUser: (user: User) => void
    clearUser: () => void
  }
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  actions: {
    setUser: (user) => set({ user }),
    clearUser: () => set({ user: null }),
  },
}))

// module-level function，可在任何地方呼叫
export function setUser(user: User) { useAuthStore.getState().actions.setUser(user) }
export function clearUser() { useAuthStore.getState().actions.clearUser() }

// router/loader.ts
import { setUser } from '../stores/auth-store'

export async function loader() {
  const user = await fetchUser()
  setUser(user)
  return user
}
```

Module-level function 直接呼叫 `setState`，不依賴 React tree，可安全用於 loader、middleware 等環境。
