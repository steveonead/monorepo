---
rule: react19-use-optimistic-scope
category: React 19 新 API
tags: [useOptimistic, optimistic-update, tanstack-query, react19]
---

# 優先用 TanStack Query 的 optimistic mutation，不適用時才用 useOptimistic

> query mutations 優先用 TanStack Query 的 onMutate/onError，不經過 Query 的本地操作才用 useOptimistic

## 原因

- TanStack Query 的 `onMutate + onError rollback` 與 cache 整合，自動處理 race condition 與 rollback
- `useOptimistic` 設計用於任何需要即時 UI 回饋的 async action，不限於是否搭配 Query
- API signature：`useOptimistic(value, reducer?)` — `reducer` 為可選，省略時直接替換值

## ❌ Bad

```tsx
// ❌ 用 useOptimistic 處理 TanStack Query 能管理的 mutation
function LikeButton({ post }: { post: Post }) {
  const [optimisticLikes, setOptimisticLikes] = useOptimistic(post.likes)

  async function handleLike() {
    setOptimisticLikes(prev => prev + 1)
    await likePost(post.id) // 直接呼叫 API，沒有 cache invalidation 或 rollback
  }

  return <button onClick={handleLike}>{optimisticLikes} 👍</button>
}
```

直接繞過 TanStack Query 的 cache，失敗時沒有 rollback，也不會觸發 cache invalidation。

## ✅ Good

```tsx
// ✅ query mutation → 用 TanStack Query 的 onMutate（cache rollback 自動處理）
function LikeButton({ post }: { post: Post }) {
  const mutation = useMutation({
    mutationFn: () => likePost(post.id),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: postKeys.detail(post.id) })
      const previous = queryClient.getQueryData(postKeys.detail(post.id))
      queryClient.setQueryData(postKeys.detail(post.id), old => ({ ...old, likes: old.likes + 1 }))
      return { previous }
    },
    onError: (_err, _vars, context) => {
      queryClient.setQueryData(postKeys.detail(post.id), context?.previous)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: postKeys.detail(post.id) })
    },
  })

  return <button onClick={() => mutation.mutate()}>{post.likes} 👍</button>
}
```

```tsx
// ✅ 非 query 的本地操作 → useOptimistic 仍適合
function TodoList({ initialItems }: { initialItems: Todo[] }) {
  const [optimisticItems, addOptimistic] = useOptimistic(
    initialItems,
    (state, newItem: Todo) => [...state, newItem],
  )

  function handleAdd(text: string) {
    const tempItem = { id: crypto.randomUUID(), text, done: false }
    startTransition(async () => {
      addOptimistic(tempItem) // optimistic 更新必須在 transition/Action 內呼叫
      await saveTodo(tempItem)
    })
  }

  return (
    <ul>
      {optimisticItems.map(item => <li key={item.id}>{item.text}</li>)}
    </ul>
  )
}
```

TanStack Query mutation 讓 cache rollback 與 invalidation 自動處理；不走 Query 的本地操作則用 `useOptimistic` 直接給即時 UI 回饋。
