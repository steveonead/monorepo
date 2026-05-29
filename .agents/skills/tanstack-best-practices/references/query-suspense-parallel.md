---
rule: query-suspense-parallel
category: tanstack-query
tags: [tanstack-query, suspense, useSuspenseQueries, waterfall, parallel]
---

# 多個 Suspense 查詢用 `useSuspenseQueries` 平行發出

> 同一元件內的多個 `useSuspenseQuery` 是串行執行的，會產生 waterfall，平行查詢必須改用 `useSuspenseQueries`。

## 原因

- `useSuspenseQuery` 每次 suspend 都會暫停整個元件渲染，下一個 `useSuspenseQuery` 要等前一個完成才開始，形成 waterfall，總耗時疊加。
- `useSuspenseQueries` 同時發出所有請求，總耗時接近最慢那一個，而非所有請求耗時之和。
- 這個行為與 `useQuery` 不同，`useQuery` 不 suspend，多個並列呼叫不會產生 waterfall。

## ❌ Bad

```ts
function Dashboard() {
  // user 請求完成 → 才開始發出 posts 請求，形成 waterfall
  const { data: user } = useSuspenseQuery(userQueryOptions)
  const { data: posts } = useSuspenseQuery(postsQueryOptions)

  return <div>...</div>
}
```

兩個請求串行執行，總耗時 = user 耗時 + posts 耗時，使用者等待時間翻倍。

## ✅ Good

```ts
function Dashboard() {
  // 兩個請求同時發出，總耗時接近最慢的那一個
  const [{ data: user }, { data: posts }] = useSuspenseQueries({
    queries: [userQueryOptions, postsQueryOptions],
  })

  return <div>...</div>
}

// 搭配 queryOptions factory 使用
const userPostsQueries = (userId: string) =>
  useSuspenseQueries({
    queries: [
      userQueryOptions(userId),
      postsByUserIdQueryOptions(userId),
    ],
  })
```

`useSuspenseQueries` 平行發出所有請求，Suspense 邊界只等最慢的那個，不會產生 waterfall。
