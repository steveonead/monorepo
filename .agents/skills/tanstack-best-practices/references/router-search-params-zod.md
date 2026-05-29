---
rule: router-search-params-zod
category: TanStack Router
tags: [tanstack-router, zod, search-params, validateSearch, loaderDeps]
---

# `validateSearch` 搭配 Zod schema，`loaderDeps` 宣告 loader 依賴的 search params

> `validateSearch` 直接傳入 Zod schema 取得型別安全的 search params 解析。`loaderDeps` 明確宣告哪些 search params 會影響 loader，params 改變時 loader 自動重跑。

## 原因

- 手動型別轉換（`Number(search.page)`、`String(search.q)`）沒有邊界保護，URL 傳入非預期值時可能產生 `NaN` 或空字串，且型別推導不準確。
- Zod schema 的 `.catch()` 提供優雅的 fallback，即使 URL 參數格式錯誤，也能回傳合理的預設值而不是讓應用程式崩潰。
- 未設定 `loaderDeps` 時，search params 改變不會觸發 loader 重跑，資料與 URL 狀態脫鉤，使用者可能看到與 URL 不符的資料。

## ❌ Bad

```ts
export const Route = createRoute({
  validateSearch: (search) => ({
    page: Number(search.page) || 1, // 手動轉型，無型別保護
    q: String(search.q ?? ""),
  }),
  // 缺少 loaderDeps：search params 改變時 loader 不會重跑
  loader: ({ context: { queryClient } }) =>
    queryClient.prefetchQuery(todosQueryOptions),
})
```

`page` 傳入 `"abc"` 時 `Number("abc")` 為 `NaN`，`NaN || 1` 雖然退回預設值，但型別推導顯示為 `number` 而非 `1`，且邏輯依賴隱式型別轉換。

## ✅ Good

```ts
import { z } from "zod"

const searchSchema = z.object({
  page: z.number().int().positive().catch(1),
  q: z.string().optional(),
})

export const Route = createRoute({
  validateSearch: searchSchema, // 直接傳入 Zod schema
  loaderDeps: ({ search: { page, q } }) => ({ page, q }), // 宣告 loader 依賴的 search params
  loader: ({ context: { queryClient }, deps: { page, q } }) =>
    queryClient.prefetchQuery(todosQueryOptions({ page, q })),
})

function TodoList() {
  const { page, q } = Route.useSearch() // 型別由 Zod schema 推導
}
```

`z.catch(1)` 讓無效的 `page` 值靜默退回預設值，型別推導準確。`loaderDeps` 讓 Router 追蹤 `page` 和 `q` 的變化，任一改變時 loader 重跑，資料與 URL 保持同步。
