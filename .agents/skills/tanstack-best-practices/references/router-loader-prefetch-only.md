---
rule: router-loader-prefetch-only
category: TanStack Router
tags: [tanstack-router, loader, prefetchQuery, ensureQueryData, blocking]
---

# Loader 只負責 prime cache；是否阻塞路由切換由 return 值決定

> Loader 的職責是預先填充 Query cache。不阻塞路由切換時用 `prefetchQuery`（不 await、不 return）；需阻塞並將錯誤拋至 `errorComponent` 時用 `return queryClient.ensureQueryData(...)`（必須 return）。

## 原因

- Loader 不應自行 fetch 並 return 資料給元件使用，元件應透過 Query hooks 訂閱資料，才能受 invalidation 和 refetch 影響。
- `prefetchQuery` 是 fire-and-forget，不阻塞路由切換，路由切換立即發生，元件自行決定是否顯示 loading state。
- `ensureQueryData` 必須 **return**（而非只 await）才能真正阻塞路由切換；只 await 不 return 時，loader 對 Router 而言是 `undefined`，路由不會等待資料就緒。

## ❌ Bad

```ts
// 錯誤：return 資料讓 useLoaderData 用，元件不透過 Query hook 訂閱，無法 refetch
export const Route = createRoute({
  loader: async ({ context: { queryClient } }) =>
    queryClient.fetchQuery(todosQueryOptions), // fetchQuery 並 return
})

// 錯誤：需要阻塞但只 await 不 return，路由仍不 blocking
export const Route = createRoute({
  loader: async ({ context: { queryClient } }) => {
    await queryClient.ensureQueryData(criticalQueryOptions) // await 但沒 return
  },
})
```

第一個例子將資料放入 loader return value，元件若用 `useLoaderData` 取得資料，不會有 Query observer，無法 refetch on focus 或受 invalidation 影響。第二個例子路由不會等待資料，`ensureQueryData` 的阻塞效果未生效。

## ✅ Good

```ts
// fire-and-forget：不阻塞路由切換，元件自行決定 blocking
export const Route = createRoute({
  loader: ({ context: { queryClient } }) => {
    queryClient.prefetchQuery(todosQueryOptions) // 不 await，不 return
  },
})

// 需阻塞路由切換並拋出錯誤至 errorComponent
export const Route = createRoute({
  loader: ({ context: { queryClient } }) =>
    queryClient.ensureQueryData(criticalQueryOptions), // return（隱含 await）才能真正阻塞
  errorComponent: CriticalErrorComponent,
})
```

`prefetchQuery` 版本讓路由切換立即發生，元件用 `useQuery` 自行處理 `isPending`。`ensureQueryData` 版本透過 return 值通知 Router 等待 Promise resolve，錯誤自動拋至 `errorComponent`。
