---
rule: router-hook-blocking-vs-deferred
category: TanStack Router
tags: [tanstack-router, tanstack-query, useSuspenseQuery, useQuery, blocking, loading]
---

# `useSuspenseQuery` 阻塞路由切換，`useQuery` 立即 render

> `useSuspenseQuery` 阻塞路由切換直到資料就緒，需搭配 `errorComponent`；`useQuery` 立即 render，自行處理 `isPending` inline loading state。依資料的重要程度選擇適合的 hook。

## 原因

- `useSuspenseQuery` 透過 Suspense 機制暫停 render，配合 Router 的 `pendingComponent` 顯示 loading UI，資料就緒後才切換畫面，使用者體驗較連貫，但切換速度取決於資料載入時間。
- `useQuery` 立即 render 元件，`data` 型別包含 `undefined`，元件需自行處理 `isPending` 狀態，適合非關鍵性的次要資料。
- 使用 `useSuspenseQuery` 時若未設定 `errorComponent`，發生錯誤時無法被捕捉，會導致畫面空白或 uncaught error。

## ❌ Bad

```ts
// 使用 useSuspenseQuery 但未設定 errorComponent
export const Route = createRoute({
  loader: ({ context: { queryClient } }) =>
    queryClient.ensureQueryData(todosQueryOptions),
  component: TodoList,
  // 缺少 errorComponent：錯誤無法被捕捉
})

function TodoList() {
  const { data: todos } = useSuspenseQuery(todosQueryOptions)
}
```

`useSuspenseQuery` 拋出的錯誤沒有 `errorComponent` 承接，會向上冒泡至最近的 React ErrorBoundary，若無對應邊界則應用程式崩潰。

## ✅ Good

```ts
// useSuspenseQuery：阻塞路由切換，搭配 errorComponent
export const BlockingRoute = createRoute({
  loader: ({ context: { queryClient } }) =>
    queryClient.ensureQueryData(todosQueryOptions),
  component: TodoList,
  errorComponent: TodoErrorComponent, // 必須設定
  pendingComponent: TodoSkeleton,
})

function TodoList() {
  const { data: todos } = useSuspenseQuery(todosQueryOptions) // data 型別非 undefined
  return <ul>{todos.map(renderTodo)}</ul>
}

// useQuery：立即 render，inline loading state
function TodoWidget() {
  const { data: todos, isPending } = useQuery(todosQueryOptions)
  if (isPending) return <Skeleton />
  return <ul>{todos?.map(renderTodo)}</ul>
}
```

`useSuspenseQuery` 的 `data` 型別保證非 `undefined`，可直接使用。`useQuery` 的 `data` 可能為 `undefined`，元件自行決定如何呈現載入中狀態。
