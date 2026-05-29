---
rule: query-options-factory
category: tanstack-query
tags: [tanstack-query, queryOptions, factory, prefetch, reuse]
---

# 用 `queryOptions()` 定義共用查詢選項

> 所有查詢配置都應透過 `queryOptions()` 封裝，確保 `queryKey`、`queryFn` 和 `staleTime` 定義一次、到處共用。

## 原因

- `queryKey` 和 `queryFn` 散落在各處時，容易出現不一致或打錯，導致 cache miss 或重複 fetch。
- `queryOptions()` 的回傳值可直接傳入 `useQuery`、`useSuspenseQuery`、`prefetchQuery`、loader，無需重複定義。
- 需要自訂 hook 時，建立在 `queryOptions()` 之上而非另立一套，保持單一來源。

## ❌ Bad

```ts
// 各處重複定義 queryKey 和 queryFn，設定容易不同步
function useTodosQuery() {
  return useQuery({ queryKey: ["todos"], queryFn: fetchTodos })
}

// loader 另外重複定義，容易與 hook 內的設定不一致
export function loader() {
  return queryClient.prefetchQuery({
    queryKey: ["todos"],
    queryFn: fetchTodos,
  })
}
```

`useTodosQuery` 和 `loader` 各自定義 `queryKey`，未來修改時必須同步改兩處，容易遺漏。

## ✅ Good

```ts
import { QueryClient, queryOptions } from "@tanstack/react-query"

const TODOS_STALE_TIME = 30_000

// 定義一次，到處共用
const todosQueryOptions = queryOptions({
  queryKey: ["todos"],
  queryFn: fetchTodos,
  staleTime: TODOS_STALE_TIME,
})

// 元件用 useQuery
function TodoList() {
  const { data } = useQuery(todosQueryOptions)
}

// 元件用 useSuspenseQuery
function TodoListSuspense() {
  const { data } = useSuspenseQuery(todosQueryOptions)
}

// loader 用 prefetchQuery，選項完全一致
export function loader({ context: { queryClient } }: { context: { queryClient: QueryClient } }) {
  return queryClient.prefetchQuery(todosQueryOptions)
}

// 需要自訂 hook 時，建立在 queryOptions 之上
function useTodosQuery() {
  return useQuery(todosQueryOptions)
}
```

`todosQueryOptions` 是唯一來源，`useQuery`、`useSuspenseQuery`、`prefetchQuery` 都吃同一份設定，修改只需改一處。
