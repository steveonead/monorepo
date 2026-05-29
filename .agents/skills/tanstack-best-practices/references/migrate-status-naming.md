---
rule: migrate-status-naming
category: migration
tags: [migration, v5, status, isPending, gcTime, isLoading]
---

# v5 的三項狀態命名變更

> `status: 'loading'` 改為 `'pending'`，`isLoading` 語意改變，`cacheTime` 改為 `gcTime`。

## 原因

- `'pending'` 更精確反映「查詢尚未完成」的語意，不限於網路請求中。
- 舊有 `isLoading` 語意含糊，v5 賦予新語意（`isPending && isFetching`）後，原語意改由 `isPending` 承擔。
- `gcTime`（garbage collection time）名稱比 `cacheTime` 更精確描述其作用。

## ❌ Bad

```ts
const queryClient = new QueryClient({
  defaultOptions: { queries: { cacheTime: 5 * 60_000 } }, // cacheTime 已重命名
})

const { isLoading, data } = useQuery({ queryKey: ["todos"], queryFn: fetchTodos })
if (isLoading) return <Spinner /> // v5 的 isLoading = isPending && isFetching，語意不同
```

v5 的 `isLoading` 同時要求「無 cache 資料」且「正在 fetching」，若有 stale cache 資料時 `isLoading` 為 `false`，導致 Spinner 不顯示。

## ✅ Good

```ts
const GC_TIME = 5 * 60_000 // 5 分鐘

const queryClient = new QueryClient({
  defaultOptions: { queries: { gcTime: GC_TIME } }, // 正確名稱
})

const { isPending, data } = useQuery({ queryKey: ["todos"], queryFn: fetchTodos })
if (isPending) return <Spinner /> // 「無 cache 資料且尚未取得」的正確判斷
```

`isPending` 等同於 v4 的 `isLoading`，代表「查詢尚無任何資料」。原 `isInitialLoading` 也由 v5 的 `isLoading` 取代。
