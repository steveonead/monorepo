---
rule: router-preload-strategy
category: Router 路由與導航
tags: [router, preload, defaultPreload, intent, staleTime]
---

# 預載用 `defaultPreload: 'intent'`，cache 新鮮度交給 React Query

> `createRouter()` 設 `defaultPreload: 'intent'` 啟用 hover / touch 預載，並設 `defaultPreloadStaleTime: 0` 關閉 router 自身的 preload cache，讓資料新鮮度完全由 React Query 的 `staleTime` 決定。

## 原因

- `'intent'` 在使用者 hover 或 touchstart 連結時就啟動 loader，預載命中率高，點擊時資料通常已就緒
- router 預設會用自己的 preload cache 暫存 loader 結果，與 React Query 的 cache 並存，等於兩套新鮮度規則各管一邊
- 設 `defaultPreloadStaleTime: 0` 後 router 不再快取 loader 結果，每次都呼叫 loader，由 `queryOptions().staleTime` 統一決定要不要真的發 request

## ❌ Bad

```ts
// 未設 preload，每次點擊都要等 loader 跑完才換頁
export const router = createRouter({
  routeTree,
  context: { queryClient },
});
```

```ts
// 開了 preload 卻沿用 router 預設的 preloadStaleTime，
// 與 React Query 各管一套 cache，新鮮度規則互相打架
export const router = createRouter({
  routeTree,
  context: { queryClient },
  defaultPreload: "intent",
});
```

## ✅ Good

```ts
export const router = createRouter({
  routeTree,
  context: { queryClient },
  defaultPreload: "intent",
  defaultPreloadStaleTime: 0, // 新鮮度交給 React Query 的 staleTime
});
```

`'intent'` 觸發 hover / touchstart 預載，`defaultPreloadStaleTime: 0` 讓 loader 內 `ensureQueryData` 一律執行，是否真的發 request 改由 `queryOptions().staleTime`（見 `query-set-global-staletime`）決定，避免 router 與 Query 兩層 cache 同時判斷新鮮度。

## 例外

特定頁面想更積極預載可於該 route 個別設 `preload`；不需預載的重量級頁面（如報表匯出）可於該 route 關閉。
