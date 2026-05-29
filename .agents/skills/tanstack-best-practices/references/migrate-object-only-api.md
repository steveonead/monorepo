---
rule: migrate-object-only-api
category: migration
tags: [migration, v5, useQuery, useMutation, api]
---

# v5 只接受物件格式參數

> 所有 hooks 的 positional arguments 格式已在 v5 移除，必須改用單一物件參數。

## 原因

- v5 統一 API 介面，移除函數重載以降低維護複雜度。
- 物件格式讓選項可選且位置無關，避免引數順序錯誤。
- TypeScript 型別推斷在物件格式下更精準。

## ❌ Bad

```ts
// v4 的 positional arguments 格式，v5 已移除
useQuery(["todos"], fetchTodos)
useQuery(["todos"], fetchTodos, { staleTime: 1000 })
useMutation(createTodo)
```

傳入多個位置引數在 v5 會直接報型別錯誤，且無法被靜態分析工具正確識別。

## ✅ Good

```ts
// v5 只接受物件格式
useQuery({ queryKey: ["todos"], queryFn: fetchTodos, staleTime: 1000 })
useMutation({ mutationFn: createTodo })
```

所有選項集中在單一物件，`queryKey` 與 `queryFn` 為必填，其餘選項皆可選。
