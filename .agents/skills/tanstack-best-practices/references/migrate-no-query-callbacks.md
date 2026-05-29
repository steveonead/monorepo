---
rule: migrate-no-query-callbacks
category: migration
tags: [migration, v5, useQuery, onSuccess, onError, onSettled, useEffect]
---

# `useQuery` 的回呼選項已移除，改用 `useEffect`

> `onSuccess`、`onError`、`onSettled` 已從 `useQuery` 移除，副作用改用 `useEffect` 監聽狀態。

## 原因

- 回呼在 React Strict Mode 下行為不穩定，可能在開發模式多次觸發。
- `useEffect` 是 React 處理副作用的標準機制，語意更清晰。
- 將副作用留在元件層，讓 Query 專注於資料同步，職責分離更明確。

## ❌ Bad

```ts
useQuery({
  queryKey: ["todos"],
  queryFn: fetchTodos,
  onSuccess: (data) => toast.success(`載入 ${data.length} 筆`), // v5 已移除
  onError: (error) => toast.error(error.message),
})
```

v5 執行此程式碼會收到 TypeScript 型別錯誤，`onSuccess` 與 `onError` 不再是合法選項。

## ✅ Good

```ts
const { data, isError, error } = useQuery({
  queryKey: ["todos"],
  queryFn: fetchTodos,
})

useEffect(() => {
  if (data) toast.success(`載入 ${data.length} 筆`)
}, [data])

useEffect(() => {
  if (isError) toast.error(error.message)
}, [isError, error])
```

`useEffect` 的依賴陣列明確宣告觸發條件，行為在 React Strict Mode 下可預測。

## 例外

`useMutation` 的 `onSuccess`、`onError`、`onSettled` 在 v5 中仍保留，此規則僅適用於 `useQuery`。
