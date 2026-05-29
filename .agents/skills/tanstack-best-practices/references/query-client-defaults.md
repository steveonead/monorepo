---
rule: query-client-defaults
category: tanstack-query
tags: [tanstack-query, QueryClient, defaultOptions, staleTime, gcTime]
---

# 在 `QueryClient` 集中設定全域預設值

> 共用的查詢配置集中在 `QueryClient.defaultOptions` 設定一次，各 `useQuery` 呼叫點不重複設定相同值。`queryOptions()` 層級的設定可覆蓋全域值。

## 原因

- 在各呼叫點個別設定相同的 `staleTime`、`gcTime` 等值，日後需要調整時必須逐一修改，容易遺漏且難以統一。
- `QueryClient.defaultOptions` 是 TanStack Query 官方設計的全域配置入口，語意清晰且易於集中審查。
- `queryOptions()` 層級可覆蓋全域值，只有真正需要不同策略的查詢才個別聲明，原則是「例外才覆蓋，否則繼承」。

## ❌ Bad

```ts
// 每個呼叫點重複設定相同值，散落各處難以統一調整
function useTodosQuery() {
  return useQuery({
    queryKey: ["todos"],
    queryFn: fetchTodos,
    staleTime: 30_000,
    gcTime: 5 * 60_000,
  })
}

function useUserQuery(id: string) {
  return useQuery({
    queryKey: ["user", id],
    queryFn: () => fetchUser(id),
    staleTime: 30_000,   // 與 useTodosQuery 完全重複
    gcTime: 5 * 60_000,  // 與 useTodosQuery 完全重複
  })
}
```

`staleTime` 和 `gcTime` 的值寫死在每個 hook 裡，未來想改成 `60_000` 需要逐一找出所有設定點修改。

## ✅ Good

```ts
const DEFAULT_STALE_TIME = 30_000  // 30 秒
const DEFAULT_GC_TIME = 5 * 60_000 // 5 分鐘

// 集中設定全域預設值，一處修改全局生效
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: DEFAULT_STALE_TIME,
      gcTime: DEFAULT_GC_TIME,
    },
  },
})

// 各 hook 不重複設定，繼承全域預設
function useTodosQuery() {
  return useQuery({ queryKey: ["todos"], queryFn: fetchTodos })
}

function useUserQuery(id: string) {
  return useQuery({ queryKey: ["user", id], queryFn: () => fetchUser(id) })
}

// 需要不同策略時，在 queryOptions 層級覆蓋全域值
const realtimeQueryOptions = queryOptions({
  queryKey: ["live-prices"],
  queryFn: fetchPrices,
  staleTime: 0,              // 即時資料不 cache
  gcTime: DEFAULT_STALE_TIME,
})
```

全域預設只寫一次，各 hook 只聲明自己特有的部分。需要不同策略的查詢在 `queryOptions` 層級明確覆蓋，覆蓋行為一目了然。
