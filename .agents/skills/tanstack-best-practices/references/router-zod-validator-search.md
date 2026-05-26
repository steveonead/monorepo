---
rule: router-zod-validator-search
category: Router 路由與導航
tags: [router, search-params, zod, validation, fallback]
---

# 以 `zodValidator(schema)` + `fallback()` 驗證 search params

> 所有含 search params 的 route 必須以 `validateSearch: zodValidator(schema)` 完成 runtime 與型別雙重驗證。預設值改用 `@tanstack/zod-adapter` 的 `fallback()`，以保留正確的型別推導。

## 原因

- 未驗證 search params 時，`Route.useSearch()` 取得的型別為 `unknown` 或寬鬆的 fallback，必須手動斷言，將失去型別安全
- Zod schema 同時提供 runtime 驗證與 TypeScript 型別，schema 即型別來源
- `fallback()` 為 `@tanstack/zod-adapter` 專為 router 設計：解析失敗時自動退回預設值，不會使整個 route 失敗
- 與 `loaderDeps`、`useSearch` 的型別推導可完整串接

## ❌ Bad

```ts
// 未驗證 search params
export const Route = createFileRoute("/posts")({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(postListOptions({ page: 1 })),
  component: PostList,
});

function PostList() {
  const search = Route.useSearch(); // 型別為 {}
}
```

```ts
// 直接傳入 Zod schema：可運作，但 input/output 型別推導不完整
export const Route = createFileRoute("/posts")({
  validateSearch: schema,
});
```

```ts
// Zod v3：原生 .catch() 在 zodValidator() 下會使輸出型別退化為 unknown
const schema = z.object({
  page: z.number().catch(1).default(1),
});
```

> **版本前提**：`.catch()` 退化型別的問題僅發生在 **Zod v3**，此時改用 `@tanstack/zod-adapter` 的 `fallback()`。若專案已升 **Zod v4**，直接用 `.catch()` 即可保留型別，不需 `fallback()`。本規則以 Zod v3 為預設情境。

## ✅ Good

```ts
import { createFileRoute } from "@tanstack/react-router";
import { fallback, zodValidator } from "@tanstack/zod-adapter";
import { z } from "zod";

const productSearchSchema = z.object({
  page: fallback(z.number().int().positive(), 1).default(1),
  sort: fallback(z.enum(["newest", "price", "rating"]), "newest").default("newest"),
  category: fallback(z.string(), "").default(""),
});

export type ProductSearch = z.infer<typeof productSearchSchema>;

export const Route = createFileRoute("/products")({
  validateSearch: zodValidator(productSearchSchema),
  loaderDeps: ({ search }) => ({
    page: search.page,
    sort: search.sort,
    category: search.category,
  }),
  loader: ({ context, deps }) =>
    context.queryClient.ensureQueryData(productListOptions(deps)),
  component: ProductListPage,
});

function ProductListPage() {
  const { page, sort } = Route.useSearch(); // 完整型別
}
```

當使用者於 URL 帶入 `?page=abc&sort=invalid` 時，`fallback()` 會將無效值自動替換為預設值（`page=1`、`sort=newest`），不會導致頁面空白。

## 例外

無。所有有 search params 的 route 都應該套用，包含只有單一參數的簡單情境。
