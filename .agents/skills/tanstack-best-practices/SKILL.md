---
name: tanstack-best-practices
description: TanStack Query 與 TanStack Router 最佳實踐規則集。撰寫、審查或重構 TanStack 程式碼時使用，涵蓋資料管理與路由導航，針對 Vite + React SPA 與 file-based routing，不適用於 SSR、TanStack Start 或 Next.js App Router。
---

# TanStack Best Practices

這份規則集針對 TanStack Query v5 + TanStack Router 在 Vite SPA 環境的搭配使用。Query 規則特別強調 v5 與 v4 的差異（如 `useSuspenseQuery` 一級公民、移除 `onSuccess`/`onError`/`onSettled`、`queryOptions()` API、`placeholderData: keepPreviousData` 等），Router 規則聚焦 file-based routing、loader / beforeLoad / search params 驗證、與 Query 的整合。

## 適用時機

- 撰寫新的 Query / Router 程式碼
- 審查既有程式碼是否使用 v5 API 與型別安全模式
- TanStack Query v4 → v5 migration
- 對 AI 產出的 Query / Router 程式碼做對齊

## 規則分類

| 分類 | 前綴 | 條數 |
|------|------|------|
| Query 資料管理 | `query-` | 9 |
| Router 路由與導航 | `router-` | 10 |
| Query + Router 整合 | `integration-` | 1 |

## 規則速查

### Query 資料管理

- `query-options-factory` — 以 `queryOptions()` 統一定義 query，跨 component / loader / prefetch 共用同一份
- `query-set-global-staletime` — 全域 `staleTime` 至少應設為 30 秒，禁止沿用預設值 `0`
- `query-suspense-first` — 優先使用 `useSuspenseQuery` + Suspense + ErrorBoundary，元件本體不寫 `isPending` / `isError` 分支
- `query-no-effect-callbacks` — `useQuery` 在 v5 移除 `onSuccess` / `onError` / `onSettled`，禁止使用
- `query-placeholderdata-keep-previous` — 分頁或篩選應使用 `placeholderData: keepPreviousData`（v5 名稱）
- `query-no-derived-state` — 不要把 query data 複製進 `useState` 或外部 store，應直接訂閱
- `query-invalidate-over-setdata` — Mutation 後優先使用 `invalidateQueries`，僅 optimistic update 才使用 `setQueryData`
- `query-mutation-declarative-invalidation` — 以 `MutationCache` 全域 `onSuccess` + `meta.invalidates` 統一定義各 mutation 影響的 keys
- `query-mutation-optimistic-flow` — Optimistic update 需完整實作 `onMutate` → `cancelQueries` → `onError` rollback → `onSettled` invalidate 四步流程

### Router 路由與導航

- `router-create-router-config` — `createRouter()` 以 `createRootRouteWithContext` 注入 `queryClient` context，loader 才能取得 `ensureQueryData`
- `router-preload-strategy` — `defaultPreload: 'intent'` 啟用 hover / touch 預載，`defaultPreloadStaleTime: 0` 讓 cache 新鮮度交給 React Query
- `router-loader-ensure-data` — Route loader 應使用 `ensureQueryData` 消除 waterfall
- `router-beforeload-auth-guard` — 以 `beforeLoad` + `throw redirect()` 實現認證守衛，禁止在 component 內以 `useEffect` 跳轉
- `router-pathless-layout-auth` — 認證守衛集中於 `_authenticated.tsx` pathless layout
- `router-loaderdeps-search` — loader 依賴 search params 必須宣告 `loaderDeps`
- `router-zod-validator-search` — 以 `zodValidator(schema)` + `fallback()` 驗證 search params
- `router-deferred-loading` — 關鍵資料 `await ensureQueryData`，非關鍵資料 `prefetchQuery`（不等待）+ `<Suspense>` 串流
- `router-state-components` — Route 必須提供 `errorComponent` / `notFoundComponent` / `pendingComponent`
- `router-type-safe-navigation` — 以 `<Link>` / `useNavigate({ from })` 實現型別安全導航，禁用 `window.location.href`

### Query + Router 整合

- `integration-shared-queryoptions` — `<Link>` hover prefetch、loader 與 component 的 `useSuspenseQuery` 必須複用同一份 `queryOptions()` 工廠

## 使用方式

讀取個別規則檔案以取得詳細說明與範例：

```
references/[類別前綴]-[規則名稱].md
```

每個規則檔案包含：
- 為何此規則重要
- 不建議的寫法（含說明）
- 建議的寫法（含說明）
- 補充說明與例外

## 環境前提

這份規則集假設：
- **Vite SPA**：純客戶端渲染，不涉及 SSR / HydrationBoundary / TanStack Start
- **React Compiler annotation mode**：需手動加 `"use memo"` 才會自動 memo，但本規則集不要求 manual `useMemo` / `useCallback`，僅在需要 stable reference 的場景明示
- **File-based routing**：所有範例使用 `createFileRoute('/path')`

## 參考來源

- [TanStack Query v5 Docs](https://tanstack.com/query/v5/docs)
- [TanStack Router Docs](https://tanstack.com/router/latest/docs)
- [TkDodo's Blog — Automatic Query Invalidation after Mutations](https://tkdodo.eu/blog/automatic-query-invalidation-after-mutations)
- [Announcing TanStack Query v5](https://tanstack.com/blog/announcing-tanstack-query-v5)
