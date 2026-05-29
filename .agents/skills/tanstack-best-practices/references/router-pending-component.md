---
rule: router-pending-component
category: TanStack Router
tags: [tanstack-router, pendingComponent, pendingMs, pendingMinMs, skeleton, loading]
---

# Blocking loader 搭配 `pendingComponent` 控制 loading UI 時機

> 搭配 blocking loader（`ensureQueryData`）時，路由切換期間由 `pendingComponent` 顯示 loading UI。用 `pendingMs` 延遲 skeleton 出現，避免快速切換閃爍；用 `pendingMinMs` 確保 skeleton 停留足夠時間。

## 原因

- Blocking loader 讓路由切換等待資料就緒，若不設定 `pendingComponent`，切換期間畫面停在前一個路由不動，使用者無法感知正在載入。
- 資料載入很快時（例如 cache hit），立即顯示再立即消失的 skeleton 反而製造視覺干擾（閃爍），`pendingMs` 設定一個延遲閾值，短於此時間的載入直接跳過 skeleton。
- 一旦 skeleton 出現，太快消失（例如不足 200ms）同樣造成閃爍，`pendingMinMs` 確保 skeleton 停留足夠時間讓使用者能辨識。

## ❌ Bad

```ts
export const Route = createRoute({
  loader: ({ context: { queryClient } }) =>
    queryClient.ensureQueryData(todosQueryOptions), // blocking loader
  component: TodoList,
  // 缺少 pendingComponent：路由切換期間畫面空白
})
```

blocking loader 讓畫面停在前一個路由，沒有任何 loading 提示，使用者不知道是點擊無效還是正在載入。

## ✅ Good

```ts
export const Route = createRoute({
  loader: ({ context: { queryClient } }) =>
    queryClient.ensureQueryData(todosQueryOptions), // blocking loader
  pendingComponent: TodoSkeleton,
  pendingMs: 300,    // 延遲 300ms 才顯示 skeleton，快速切換不閃爍
  pendingMinMs: 500, // skeleton 至少顯示 500ms，避免一閃即逝
  component: TodoList,
  errorComponent: TodoErrorComponent,
})
```

載入在 300ms 內完成時，使用者看不到 skeleton，直接看到資料，切換感覺即時。載入超過 300ms 時，skeleton 出現並至少停留 500ms，使用者有連貫的等待體驗。
