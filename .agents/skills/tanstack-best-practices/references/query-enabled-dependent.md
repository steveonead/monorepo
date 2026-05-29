---
rule: query-enabled-dependent
category: tanstack-query
tags: [tanstack-query, enabled, dependent-queries, conditional-fetch]
---

# 條件查詢用 `enabled` 控制，不用強制斷言繞過型別

> 依賴其他資料或條件才能發出請求時，透過 `enabled` 控制，讓 TanStack Query 負責跳過請求，元件只需處理 `data` 為 `undefined` 的狀態。

## 原因

- 用 `!` 強制斷言 `undefined` 為非空型別，會在 `userId` 實際為 `undefined` 時引發 runtime 錯誤，TypeScript 的型別保護完全失效。
- `enabled: false` 時 TanStack Query 不發出請求，`data` 保持 `undefined`，行為明確且可預期。
- 相依查詢（dependent queries）是常見場景，`enabled` 是官方設計用來處理這個情境的機制。

## ❌ Bad

```ts
function UserPosts({ userId }: { userId: string | undefined }) {
  const { data: posts } = useQuery({
    queryKey: ["posts", userId],
    queryFn: () => fetchPosts(userId!), // userId 可能為 undefined，強制斷言不安全
  })
}
```

`userId` 為 `undefined` 時，`fetchPosts(undefined!)` 會發出無效請求或拋出 runtime 錯誤，`!` 完全繞過型別系統的保護。

## ✅ Good

```ts
function UserPosts({ userId }: { userId: string | undefined }) {
  const { data: posts } = useQuery({
    queryKey: ["posts", userId],
    queryFn: () => fetchPosts(userId!), // enabled 保證執行時 userId 不為 undefined
    enabled: !!userId,                  // userId 存在才發出請求
  })

  // enabled: false 時 data 是 undefined，需明確處理
  if (!userId) return null

  return <PostList posts={posts} />
}

// 相依查詢：依賴前一個 query 的結果
function UserProfile({ username }: { username: string }) {
  const { data: user } = useQuery(userByUsernameQueryOptions(username))

  const { data: posts } = useQuery({
    ...postsByUserIdQueryOptions(user?.id ?? ""),
    enabled: !!user?.id, // 等 user.id 取得後才查 posts
  })

  return <div>...</div>
}
```

`enabled: !!userId` 確保 `queryFn` 只在 `userId` 有值時執行，在 `enabled` 保護下內部使用 `!` 是安全的。相依查詢透過 `enabled: !!user?.id` 形成串接，不需要 callback 或 effect。
