---
rule: query-stale-time-strategy
category: tanstack-query
tags: [tanstack-query, staleTime, gcTime, cache, refetch]
---

# 明確設定 `staleTime`，並確保 `gcTime >= staleTime`

> 全域 `staleTime` 預設為 0，多數 app 都該調高，且 `gcTime` 強烈建議不小於 `staleTime`，否則 cache 提早被 GC，`staleTime` 形同虛設。

## 原因

- 預設 `staleTime: 0` 代表每次元件 mount 或 window focus 都會重新 fetch，多數業務場景下過於頻繁。
- `gcTime` 控制 inactive cache 存活時間，若 `gcTime < staleTime`，資料在 stale 之前就可能被 GC，下次請求無法從 cache 取得舊值。

## ❌ Bad

```ts
// staleTime 預設 0：每次 mount 和 window focus 都 refetch，多數情況過於頻繁
const queryClient = new QueryClient()

// gcTime 低於 staleTime：cache 在變 stale 前就被 GC，staleTime 形同虛設
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60_000, // 5 分鐘
      gcTime: 60_000,         // 1 分鐘，比 staleTime 短
    },
  },
})
```

第二個例子的 `gcTime` 只有 1 分鐘，cache 在 5 分鐘的 `staleTime` 到期前就被清除，等於每次都要重新 fetch。

## ✅ Good

```ts
const todosQueryOptions = queryOptions({
  queryKey: ["todos"],
  queryFn: fetchTodos,
  staleTime: 5 * 60_000,  // 5 分鐘
  gcTime: 10 * 60_000,    // 不小於 staleTime
})

// 即時資料：staleTime 為 0，gcTime 仍保持正值
const pricesQueryOptions = queryOptions({
  queryKey: ["live-prices"],
  queryFn: fetchPrices,
  staleTime: 0,
  gcTime: 30_000,
})
```

`gcTime` 必須不小於 `staleTime`，確保 cache 在 stale 後仍存活供背景更新使用。
