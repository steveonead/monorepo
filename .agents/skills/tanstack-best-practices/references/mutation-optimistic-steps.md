---
rule: mutation-optimistic-steps
category: mutation
tags: [mutation, optimistic-update, onMutate, onError, onSettled]
---

# Optimistic Update 的五步驟標準作法

> Optimistic Update 必須在三個 callback 內完成五個動作，缺少任何一步都可能造成競態或狀態不一致。

## 原因

- `onMutate` 若不先 `cancelQueries`，進行中的 refetch 可能在 `setQueryData` 之後才回來，以 server 舊資料覆蓋樂觀更新，導致 UI 閃爍。
- 沒有 snapshot 就無法在 `onError` 還原，失敗後 UI 會停留在錯誤的樂觀狀態。
- 不在 `onSettled` 呼叫 `invalidateQueries`，client 與 server 資料可能長期不同步。

## ❌ Bad

```ts
useMutation({
  mutationFn: updateTodo,
  onMutate: async (newTodo) => {
    // 缺少 cancelQueries：進行中的 refetch 可能在 setQueryData 之後回來覆蓋樂觀更新
    queryClient.setQueryData(todoKeys.all, (old: Todo[]) => [...old, newTodo])
  },
  onSettled: () => queryClient.invalidateQueries({ queryKey: todoKeys.all }),
  // 缺少 onError restore：失敗後 UI 停留在錯誤狀態
})
```

缺少 `cancelQueries` 會引入競態條件，缺少 `onError` 還原則讓失敗情境無法恢復。

## ✅ Good

```ts
type MutationContext = {
  previousTodos: Todo[] | undefined
}

useMutation({
  mutationFn: updateTodo,
  onMutate: async (newTodo): Promise<MutationContext> => {
    // 1. 取消 outgoing refetches，避免競態覆蓋
    await queryClient.cancelQueries({ queryKey: todoKeys.all })
    // 2. Snapshot 舊資料，供 onError 還原
    const previousTodos = queryClient.getQueryData<Todo[]>(todoKeys.all)
    // 3. 寫入樂觀更新
    queryClient.setQueryData<Todo[]>(todoKeys.all, (old) => [...(old ?? []), newTodo])
    return { previousTodos }
  },
  onError: (_err, _variables, context) => {
    // 4. 失敗時還原至 snapshot
    queryClient.setQueryData(todoKeys.all, context?.previousTodos)
  },
  onSettled: () => {
    // 5. 無論成敗都與 server 同步
    queryClient.invalidateQueries({ queryKey: todoKeys.all })
  },
})
```

五個步驟各司其職：步驟一防競態、步驟二備份、步驟三更新 UI、步驟四還原失敗、步驟五同步 server。

## 例外

若不需要在失敗時還原 UI（例如純刪除操作且用戶接受錯誤後重新 fetch），可省略 `onError`，改在 `onSettled` 統一處理 invalidation。此時 `onSettled` 同時承擔失敗後的同步職責。

Optimistic update 裡 `onSettled` 的 `invalidateQueries` 是必要的同步步驟，應保留在 mutation 內，不適合透過 global callback 集中管理。
