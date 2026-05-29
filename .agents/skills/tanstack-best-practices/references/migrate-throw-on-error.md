---
rule: migrate-throw-on-error
category: migration
tags: [migration, v5, throwOnError, useErrorBoundary, ErrorBoundary]
---

# `useErrorBoundary` 重命名為 `throwOnError`

> v4 的 `useErrorBoundary` 選項在 v5 重命名為 `throwOnError`，支援布林值或條件函式。

## 原因

- 名稱更直觀描述行為：「拋出錯誤」而非「使用 Error Boundary」。
- 函式形式讓錯誤條件可依 HTTP status 或錯誤類型細分，不需全部拋出。
- `useSuspenseQuery` 不支援此選項，其 error 固定傳播至最近的 Error Boundary。

## ❌ Bad

```ts
useQuery({
  queryKey: ["todos"],
  queryFn: fetchTodos,
  useErrorBoundary: true, // v4 API，v5 已重命名
})
```

v5 中 `useErrorBoundary` 不是合法選項，TypeScript 會報型別錯誤，錯誤不會被 Error Boundary 捕獲。

## ✅ Good

```ts
// boolean：所有錯誤都拋出
useQuery({
  queryKey: ["todos"],
  queryFn: fetchTodos,
  throwOnError: true,
})

// function：條件性拋出
useQuery({
  queryKey: ["todos"],
  queryFn: fetchTodos,
  throwOnError: (error) => error.status >= 500, // 只拋出 5xx 錯誤
})
```

函式形式的 `throwOnError` 接收 `error` 物件，回傳 `true` 則拋出至最近的 Error Boundary，回傳 `false` 則由元件自行處理。

## 例外

`useSuspenseQuery` 不支援 `throwOnError` 選項，其 error 固定傳播至最近的 Error Boundary，無法透過選項控制。
