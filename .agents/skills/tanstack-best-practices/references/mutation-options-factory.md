---
rule: mutation-options-factory
category: mutation
tags: [mutation, mutationOptions, factory, reuse]
---

# 用 `mutationOptions()` 封裝可共用的 mutation 設定

> mutation 設定透過 `mutationOptions()` 定義一次，讓多個元件共用同一份 `mutationFn` 與 lifecycle callback。

## 原因

- mutation 設定散落各元件時，`mutationFn` 與 callback 邏輯容易重複，維護時需同步修改多處
- `mutationOptions()` 與 `queryOptions()` 作用對稱，讓 feature 的讀寫設定可並排集中管理

## ❌ Bad

```ts
// 各元件各自定義相同的 mutationFn 與 callback，邏輯重複
function ComponentA() {
  return useMutation({
    mutationFn: addGroup,
    onError: (error) => toast.error(error.message),
  })
}

function ComponentB() {
  return useMutation({
    mutationFn: addGroup,
    onError: (error) => toast.error(error.message),
  })
}
```

共用邏輯分散兩處，往後修改需手動同步。

## ✅ Good

```ts
import { mutationOptions } from '@tanstack/react-query'

// 定義一次，到處共用（包含共用的 onError 邏輯）
function addGroupMutationOptions() {
  return mutationOptions({
    mutationFn: addGroup,
    onError: (error) => toast.error(error.message),
  })
}

// 直接帶入
function ComponentA() {
  return useMutation(addGroupMutationOptions())
}

// 覆寫 callback：先儲存結果，再透過 optional chaining 保留基底邏輯
function ComponentB() {
  const queryClient = useQueryClient()
  const opts = addGroupMutationOptions()
  return useMutation({
    ...opts,
    onError: (...args) => {
      opts.onError?.(...args)       // 保留基底的 toast 邏輯
      logger.capture(args[0])       // 加上頁面專屬行為
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['groups'] }),
  })
}

// 可與 queryOptions 並排放在同一 feature namespace
export const groupMutations = {
  add: addGroupMutationOptions,
}
export const groupQueries = {
  list: () => queryOptions({ queryKey: ['groups'], queryFn: fetchGroups }),
}
```

共用邏輯集中在 factory，各元件只補充自己的 side effect。覆寫 callback 時先儲存 factory 結果再引用，避免重複呼叫。
