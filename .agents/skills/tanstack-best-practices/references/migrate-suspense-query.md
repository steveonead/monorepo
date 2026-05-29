---
rule: migrate-suspense-query
category: migration
tags: [migration, v5, useSuspenseQuery, suspense, Suspense]
---

# Suspense 改用 `useSuspenseQuery`

> `useQuery({ suspense: true })` 的實驗性選項已在 v5 移除，改用獨立的 `useSuspenseQuery` hook。

## 原因

- `suspense` 選項在 v4 為實驗性，v5 正式以獨立 hook 穩定化。
- `useSuspenseQuery` 的 `data` 型別保證非 `undefined`，省去 optional chaining。
- 職責分離：Suspense 行為封裝在 hook 中，使用端無需額外傳入選項。

## ❌ Bad

```ts
// v5 已移除 suspense 選項
const { data } = useQuery({
  queryKey: ["todos"],
  queryFn: fetchTodos,
  suspense: true,
})
// data 型別仍是 Todo[] | undefined，需要 optional chaining
return <div>{data?.map(...)}</div>
```

`suspense: true` 在 v5 不再是合法選項，TypeScript 會報型別錯誤。

## ✅ Good

```ts
// 使用 useSuspenseQuery，需在外層包 <Suspense>
const { data } = useSuspenseQuery({
  queryKey: ["todos"],
  queryFn: fetchTodos,
})
// data 型別保證是 Todo[]，無需 optional chaining
return <div>{data.map(...)}</div>
```

外層元件必須包 `<Suspense fallback={<Spinner />}>`，錯誤則由最近的 Error Boundary 捕獲。

## 例外

`useSuspenseQuery` 不支援 `enabled`、`throwOnError`、`placeholderData` 三個選項，需要條件性查詢時改用 `useQuery`。
