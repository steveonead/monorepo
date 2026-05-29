---
rule: migrate-infinite-query-params
category: migration
tags: [migration, v5, useInfiniteQuery, initialPageParam, pageParam]
---

# `useInfiniteQuery` 的 `initialPageParam` 為必填

> v5 移除 `pageParam` 的預設值，改以必填的 `initialPageParam` 選項明確宣告初始頁碼。

## 原因

- 將初始值從 `queryFn` 內部移到選項層，讓 Query 可正確序列化與快取初始狀態。
- 明確必填避免開發者忘記宣告初始頁，導致第一次 fetch 的 `pageParam` 為 `undefined`。
- `getNextPageParam` 回傳 `undefined` 或 `null` 統一代表無下一頁，語意一致。

## ❌ Bad

```ts
useInfiniteQuery({
  queryKey: ["todos"],
  queryFn: ({ pageParam = 0 }) => fetchTodos(pageParam), // v5 不再允許 pageParam 預設值
  getNextPageParam: (lastPage) => lastPage.nextCursor,
  // 缺少 initialPageParam
})
```

v5 中 `pageParam` 的型別由 `initialPageParam` 推斷，在 `queryFn` 內設預設值會被 TypeScript 標記為多餘，且行為不符預期。

## ✅ Good

```ts
useInfiniteQuery({
  queryKey: ["todos"],
  queryFn: ({ pageParam }) => fetchTodos(pageParam),
  initialPageParam: 0, // 必填，v5 要求
  getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  // undefined 或 null 都表示無下一頁
})
```

`initialPageParam` 的型別決定 `pageParam` 的型別，兩者必須一致，TypeScript 會自動驗證。
