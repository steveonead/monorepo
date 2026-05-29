---
rule: query-key-factory
category: tanstack-query
tags: [tanstack-query, queryKey, factory, invalidate, cache]
---

# 每個 feature 建立 Query Key Factory

> `queryKey` 結構從廣到窄集中定義，讓批量 invalidate 和精確查詢都可以用同一份宣告完成。

## 原因

- `queryKey` 散落在各呼叫點時，拼字錯誤或結構不一致會導致 invalidate 無效，cache 沒有如預期清除。
- 從廣到窄的層級結構讓 `invalidateQueries` 可以精確或批量操作，不需手動列舉。
- 集中定義後，重構 key 結構只需改一個地方。

## ❌ Bad

```ts
// 各處 key 寫法不一致，無法統一 invalidate
useQuery({ queryKey: ["todos", userId, page], queryFn: fetchPage })

// invalidate 只能手動列舉，容易遺漏
queryClient.invalidateQueries({ queryKey: ["todos", userId] })

// 其他地方用了不同結構
useQuery({ queryKey: ["todo", "list", userId], queryFn: fetchList })
```

key 結構不統一，`invalidateQueries` 無法正確命中所有相關 cache。

## ✅ Good

```ts
// 集中定義，從廣到窄
const todoKeys = {
  all: ["todos"] as const,
  lists: () => [...todoKeys.all, "list"] as const,
  list: (userId: string) => [...todoKeys.lists(), userId] as const,
  paged: (userId: string, page: number) =>
    [...todoKeys.list(userId), page] as const,
  detail: (id: string) => [...todoKeys.all, "detail", id] as const,
}

// 精確查詢
useQuery({ queryKey: todoKeys.paged(userId, page), queryFn: fetchPage })

// 批量 invalidate 整個 feature 的 cache
queryClient.invalidateQueries({ queryKey: todoKeys.all })

// 只 invalidate 某個 user 的 list
queryClient.invalidateQueries({ queryKey: todoKeys.list(userId) })

// 搭配 queryOptions 使用
function todoDetailQueryOptions(id: string) {
  return queryOptions({
    queryKey: todoKeys.detail(id),
    queryFn: () => fetchTodo(id),
  })
}
```

key 結構有層級，`invalidateQueries` 用前綴比對即可精確或批量操作，不需手動維護字串清單。
