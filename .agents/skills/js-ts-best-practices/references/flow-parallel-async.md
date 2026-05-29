---
rule: flow-parallel-async
category: 控制流程
tags: [flow, async, promise, performance]
---

# 獨立 async 操作用 `Promise.all` / `Promise.allSettled`

> 多個互不相依的 async 操作必須用 `Promise.all` 平行執行，禁止連續 `await` 串行等待。

## 原因

- 連續 `await` 串行執行，總耗時是各操作之和，平行執行只等最慢那個
- `Promise.allSettled` 適合需要知道每個操作結果的場景，不因單一失敗而中斷

## ❌ Bad

```ts
async function loadDashboard(userId: string) {
  const user = await fetchUser(userId);
  const posts = await fetchPosts(userId); // 等 user 回來才開始，但兩者毫無依賴
  return { user, posts };
}
```

`fetchUser` 與 `fetchPosts` 互不相依，卻被迫串行執行，總耗時 = 兩者之和。

## ✅ Good

```ts
async function loadDashboard(userId: string) {
  const [user, posts] = await Promise.all([
    fetchUser(userId),
    fetchPosts(userId),
  ]);
  return { user, posts };
}

// 需要知道每個操作是否成功時
async function syncAll(items: Item[]) {
  const results = await Promise.allSettled(items.map(syncItem));
  const failed = results.filter((r) => r.status === "rejected");
  if (failed.length > 0) logger.error("部分同步失敗", failed);
}
```

`Promise.all` 讓兩個請求同時發出，總耗時等於最慢那個。`Promise.allSettled` 確保單一失敗不中斷其他操作。
