---
name: tanstack-best-practices
description: TanStack Query v5 + Router v1 最佳實踐規則集，供撰寫、審查或重構 TanStack Query/Router 相關程式碼時參考。適用於純 SPA + React 19 + TypeScript strict mode 的專案。不適用於 TanStack Query v4 或 React Router。
---

# TanStack Query v5 + Router v1 Best Practices

這份規則集涵蓋 TanStack Query v5 的 Breaking Changes、Query 設計模式、Mutation 策略，以及 TanStack Router v1 與 Query 的整合實踐。

## 適用時機

參考這份規則集的時機：
- 撰寫新的 TanStack Query 或 TanStack Router 程式碼
- 審查現有程式碼是否使用了 v4 的舊 API
- 重構或最佳化 Query 的 cache 策略與 Router 整合方式

## 規則分類

| 分類 | 前綴 |
|------|------|
| v5 API 遷移 | `migrate-` |
| Query 設計 | `query-` |
| Mutation | `mutation-` |
| Router 整合 | `router-` |

## 規則速查

### v5 API 遷移

- `migrate-object-only-api` — hooks 只接受物件格式，禁用 v4 函數重載
- `migrate-status-naming` — status/isLoading/cacheTime 命名更新為 v5 版本
- `migrate-no-query-callbacks` — onSuccess/onError/onSettled 已從 useQuery 移除
- `migrate-keep-previous-data` — keepPreviousData 改用 placeholderData + keepPreviousData 函式
- `migrate-suspense-query` — Suspense 模式改用 useSuspenseQuery
- `migrate-infinite-query-params` — useInfiniteQuery 要求 initialPageParam 必填
- `migrate-throw-on-error` — useErrorBoundary 重命名為 throwOnError

### Query 設計

- `query-options-factory` — queryOptions() 作為主要抽象，跨場景共用
- `query-key-factory` — 每個 feature 一個 Key Factory，支援批量 invalidate
- `query-stale-time-strategy` — 全域 staleTime 策略與 gcTime 設定原則
- `query-suspense-parallel` — 同元件多 query 用 useSuspenseQueries 避免 waterfall
- `query-select-stable-ref` — select 傳入穩定函式引用，避免多餘重算
- `query-enabled-dependent` — enabled 控制依賴查詢的發出時機
- `query-client-defaults` — QueryClient 全域 defaults 集中設定

### Mutation

- `mutation-options-factory` — 用 mutationOptions() 封裝可共用的 mutation 設定，mutationKey 用於 filter 時必填
- `mutation-optimistic-steps` — Optimistic Update 的標準三 callback 五動作流程
- `mutation-cache-invalidation` — mutationCache global callback + meta.invalidates 集中管理 invalidation

### Router 整合

- `router-query-client-context` — QueryClient 注入 Router Context 的正確方式
- `router-disable-preload-cache` — 關閉 Router 內建快取，讓 Query 全權管理 freshness
- `router-loader-prefetch-only` — Loader 只負責 prime cache，不決定 blocking
- `router-no-loader-data` — 元件永遠用 Query hooks，不用 useLoaderData
- `router-hook-blocking-vs-deferred` — useSuspenseQuery vs useQuery 決定路由 blocking 行為
- `router-search-params-zod` — Search params 用 Zod 驗證 + loaderDeps 宣告依賴
- `router-error-boundary` — errorComponent + useQueryErrorResetBoundary 正確重置錯誤狀態
- `router-pending-component` — pendingComponent + pendingMs 控制路由切換 loading 畫面
- `router-link-preload` — Link preload="intent" 開啟 hover prefetch

## 使用方式

讀取個別規則檔案以取得詳細說明與範例：

```
references/[類別前綴]-[規則名稱].md
```

每個規則檔案包含：
- 說明此規則重要的原因
- 不建議的寫法（含說明）
- 建議的寫法（含說明）
- 補充說明與參考
