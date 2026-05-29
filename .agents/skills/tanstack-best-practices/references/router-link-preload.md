---
rule: router-link-preload
category: TanStack Router
tags: [tanstack-router, preload, Link, intent, performance]
---

# `<Link preload="intent">` 搭配 `defaultPreloadStaleTime: 0` 實現即時路由切換

> `<Link preload="intent">` 在 hover 或 focus 時觸發 loader prefetch，搭配 `defaultPreloadStaleTime: 0` 確保每次都交由 Query 判斷是否需要 refetch，兩者合用讓路由切換近乎即時。

## 原因

- 不設定 `preload` 時，使用者點擊後才觸發 loader，資料尚未就緒前畫面停在 loading 狀態。
- `preload="intent"` 同時涵蓋 hover 和 focus，利用游標移動到點擊的時間差預載資料。

## ❌ Bad

```ts
// 點擊後才觸發 loader，有明顯 loading delay
<Link to="/todos">Todos</Link>
```

## ✅ Good

```ts
<Link to="/todos" preload="intent">Todos</Link>
```

hover 或 focus 時預先觸發 loader，使用者點擊時資料可能已就緒，路由切換近乎即時。

## 例外

全域導覽列或 sidebar 的連結通常 hover 頻繁，可視情況評估是否要設定較長的 `defaultPreloadStaleTime`，或針對特定 `<Link>` 設定 `preload={false}` 避免過度 prefetch。
