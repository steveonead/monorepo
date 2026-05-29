---
rule: router-no-loader-data
category: TanStack Router
tags: [tanstack-router, tanstack-query, useLoaderData, useSuspenseQuery, observer]
---

# 元件透過 Query hooks 取得資料，不用 `useLoaderData`

> 元件永遠透過 `useQuery` 或 `useSuspenseQuery` 訂閱資料，不從 `useLoaderData` 取值。`useLoaderData` 沒有 Query observer，不受 refetch on focus 和 invalidation 影響。

## 原因

- `useLoaderData` 回傳的是 loader return value 的靜態快照，沒有 Query observer，視窗重新 focus 時不會 refetch，mutation 後的 invalidation 也不會觸發更新。
- Query cache 有 GC 機制，若沒有 observer 訂閱，資料可能提早被清除，導致畫面顯示過期資料。
- Loader 的職責只是 prime cache（`prefetchQuery` 或 `ensureQueryData`），資料的訂閱與更新由 Query hooks 全權負責，兩者職責分離。

## ❌ Bad

```ts
export const Route = createRoute({
  loader: async ({ context: { queryClient } }) =>
    queryClient.ensureQueryData(todosQueryOptions),
  component: TodoList,
})

function TodoList() {
  // 沒有 Query observer：不 refetch on focus，invalidation 後不更新，可能提早被 GC
  const todos = Route.useLoaderData()
}
```

元件取得的是 loader 執行當下的資料快照，之後的 cache 更新（invalidation、background refetch）都不會反映到畫面上。

## ✅ Good

```ts
export const Route = createRoute({
  loader: ({ context: { queryClient } }) =>
    queryClient.ensureQueryData(todosQueryOptions), // prime cache
  component: TodoList,
})

function TodoList() {
  // 有 Query observer：refetch on focus、受 invalidation 影響
  const { data: todos } = useSuspenseQuery(todosQueryOptions)
}
```

Loader 確保資料在切換時已在 cache 中，`useSuspenseQuery` 則建立 observer 訂閱後續更新，兩者職責清晰分離。
