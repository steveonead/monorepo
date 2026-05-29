---
rule: router-query-client-context
category: TanStack Router
tags: [tanstack-router, tanstack-query, context, queryClient]
---

# Router Context 注入 QueryClient

> 用 `createRootRouteWithContext<{ queryClient: QueryClient }>()()` 宣告型別，讓 loader 型別安全地存取 `queryClient`，並確保 Router 與 `QueryClientProvider` 共用同一個 instance。

## 原因

- Router 的 `loader` 需要存取 `queryClient`，若未透過 context 傳入，只能靠模組層級的全域變數，難以測試也無法在多 router 情境下共用。
- `createRootRouteWithContext` 在型別層面強制每個 `loader` 都能安全解構 `context`，不需型別斷言。
- Router 與 `QueryClientProvider` 共用同一個 instance，確保 loader 操作的 cache 和元件訂閱的 cache 是同一份。

## ❌ Bad

```ts
// 無型別約束的 root route，無法在 loader 中安全存取 queryClient
const rootRoute = createRootRoute({
  component: RootComponent,
})

// queryClient 沒有注入 router context
const router = createRouter({ routeTree })
```

loader 中必須靠模組全域變數取得 `queryClient`，無法透過型別系統確保一致性，也無法在測試中替換 instance。

## ✅ Good

```ts
import { QueryClient } from "@tanstack/react-query"
import { createRootRouteWithContext, createRouter } from "@tanstack/react-router"

type RouterContext = {
  queryClient: QueryClient
}

const rootRoute = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
})

const queryClient = new QueryClient()
const router = createRouter({
  routeTree,
  context: { queryClient }, // 注入 queryClient 到 router context
})

// Router 與 QueryClientProvider 共用同一個 instance
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  )
}

// loader 中型別安全地存取 queryClient
export const Route = createRoute({
  getParentRoute: () => rootRoute,
  loader: ({ context: { queryClient } }) =>
    queryClient.prefetchQuery(todosQueryOptions),
})
```

`createRootRouteWithContext` 將 `RouterContext` 型別向下傳遞到所有子 route，每個 loader 的 `context` 參數都有完整型別推導，無需手動斷言。
