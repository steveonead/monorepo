---
rule: hooks-effect-external-only
category: Hooks 用法
tags: [useEffect, side-effects, external-system]
---

# useEffect 只用於同步外部系統

> useEffect 的職責是橋接 React 與外部世界，data transformation、derived state、data fetching 都不屬於它的範疇。

## 原因

- 用 useEffect 處理 derived state 會製造額外的 render cycle
- data fetching 放在 useEffect 沒有 cache、deduplication、race condition 保護，應改用 TanStack Query
- 誤用 useEffect 讓資料流難以追蹤，副作用與渲染邏輯交錯

## ❌ Bad

```tsx
// 用 useEffect 做 data transformation
function UserList({ users }: { users: User[] }) {
  const [filtered, setFiltered] = useState<User[]>([])

  useEffect(() => {
    setFiltered(users.filter(user => user.active))
  }, [users])

  return <ul>{filtered.map(user => <li key={user.id}>{user.name}</li>)}</ul>
}
```

多一個 state、多一次 render，且 `filtered` 與 `users` 永遠有一個 render 的落差。

## ✅ Good

```tsx
// 直接在 render 時計算
function UserList({ users }: { users: User[] }) {
  const filtered = users.filter(user => user.active)
  return <ul>{filtered.map(user => <li key={user.id}>{user.name}</li>)}</ul>
}
```

derived value 直接在 render 時計算，不需 state 也不需 effect，資料流一目了然。

## 例外

useEffect 的合法場景：

- 訂閱 DOM event 或 WebSocket
- 整合第三方 library（如地圖、圖表）
- 控制非 React widget 的生命周期
