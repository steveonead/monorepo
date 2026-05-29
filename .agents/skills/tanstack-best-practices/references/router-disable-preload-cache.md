---
rule: router-disable-preload-cache
category: TanStack Router
tags: [tanstack-router, preload, cache, staleTime]
---

# 設定 `defaultPreloadStaleTime: 0` 讓 Query 全權管理 freshness

> 設定 `defaultPreloadStaleTime: 0`，讓 Router 的 preload cache 立即過期，由 TanStack Query 判斷是否需要 refetch，避免兩套 cache 機制同時生效產生衝突。

## 原因

- TanStack Router 內建 preload cache 預設 stale time 為 30 秒，hover 觸發 preload 後的 30 秒內再次導航，Router 直接使用自己的 cache，不會經過 Query 的 freshness 判斷。
- 同時存在 Router cache 和 Query cache 兩套機制，資料新鮮度的邏輯分散在兩處，難以維護且容易產生不一致。
- 設定為 `0` 後，Router preload cache 立即過期，每次導航都交由 Query 依據 `staleTime` 決定是否重新 fetch，只需維護一套 cache 策略。

## ❌ Bad

```ts
const router = createRouter({
  routeTree,
  context: { queryClient },
  // 未設定 defaultPreloadStaleTime：Router 的 preload cache 預設 30 秒
  // hover 觸發 preload 後，30 秒內再次導航會直接用 Router cache 而不經過 Query
})
```

Router 的 30 秒 preload cache 覆蓋了 Query 的 freshness 判斷，導致 Query 設定的 `staleTime` 在 preload 場景下失效。

## ✅ Good

```ts
const router = createRouter({
  routeTree,
  context: { queryClient },
  defaultPreloadStaleTime: 0, // Router preload cache 立即過期，Query 全權管理 freshness
})
```

所有 freshness 判斷統一由 Query 的 `staleTime` 控制，Router 只負責觸發 preload，不介入 cache 有效期的決策。
