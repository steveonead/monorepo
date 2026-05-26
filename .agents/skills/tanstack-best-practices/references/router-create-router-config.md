---
rule: router-create-router-config
category: Router 路由與導航
tags: [router, setup, createRouter, context, queryClient]
---

# `createRouter()` 必須以 context 注入 `queryClient`

> 建立 router 時用 `createRootRouteWithContext` 宣告 context 型別並注入 `queryClient`，loader 才能取得 `ensureQueryData`。預載相關設定（`defaultPreload`、`defaultPreloadStaleTime`）見 `router-preload-strategy`。

## 原因

- loader 透過 `context.queryClient.ensureQueryData()` 提前載入資料，未注入 `queryClient` 則 Query + Router 整合無從運作
- `createRootRouteWithContext<T>()` 在型別層宣告 context 形狀，子 route 的 `beforeLoad` / `loader` 取用 `context.queryClient` 時有完整型別推導
- 透過 `Register` interface 註冊 router 型別，`<Link>`、`useNavigate` 才能取得路徑自動補全與靜態檢查

## ❌ Bad

```ts
// 未注入 context，loader 拿不到 queryClient
const router = createRouter({ routeTree });
```

```ts
// __root.tsx 用 createRootRoute，無法宣告 context 型別
export const Route = createRootRoute({
  component: RootLayout,
});
```

## ✅ Good

```ts
// __root.tsx
import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import type { QueryClient } from "@tanstack/react-query";

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
}>()({
  component: RootLayout,
});

function RootLayout() {
  return (
    <>
      <Outlet />
      {import.meta.env.DEV && <DevToolsBar />}
    </>
  );
}
```

```ts
// router.ts
import { createRouter } from "@tanstack/react-router";
import { QueryClient } from "@tanstack/react-query";
import { routeTree } from "./routeTree.gen";

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000 } },
});

export const router = createRouter({
  routeTree,
  context: { queryClient },
  // 預載策略見 router-preload-strategy
  defaultPreload: "intent",
  defaultPreloadStaleTime: 0,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
```

```tsx
// main.tsx
<QueryClientProvider client={queryClient}>
  <RouterProvider router={router} />
</QueryClientProvider>
```

## 例外

純靜態路由（不整合 React Query）可不注入 queryClient；本 skill 預設為整合場景，純靜態路由不在討論範圍。
