---
rule: deprecated-merge
category: 廢棄 API
tags: [deprecated, merge, extend, shape]
---

# 禁用 `.merge()`，改用 `.extend()` 或 object spread

> `.merge()` 在 v4 已 deprecated；一般情況改用 `.extend(OtherSchema.shape)`，需最佳 tsc 效能時用 `z.object({ ...A.shape, ...B.shape })`。

## 原因

- `.merge()` 已標記 deprecated，未來 major 版本將移除
- `.extend()` 接受的是 shape 物件（`OtherSchema.shape`），不是 schema 本身，這是常見踩坑點
- Object spread 組合 `.shape` 是官方推薦的最佳 tsc 效能寫法，適合大型 schema

## ❌ Bad

```ts
const BaseSchema = z.object({ id: z.string() });
const ExtSchema = z.object({ name: z.string() });

// deprecated，v4 不應繼續使用
const MergedSchema = BaseSchema.merge(ExtSchema);
```

`.merge()` 已 deprecated，且語意容易與 `.extend()` 混淆（兩者行為不完全相同）。

## ✅ Good

```ts
const BaseSchema = z.object({ id: z.string() });
const ExtSchema = z.object({ name: z.string() });

// 一般情況：傳入另一個 schema 的 .shape，不是 schema 本身
const MergedSchema = BaseSchema.extend(ExtSchema.shape);

// 需最佳 tsc 效能時（官方推薦）：object spread 組合兩個 .shape
const MergedSchema2 = z.object({
  ...BaseSchema.shape,
  ...ExtSchema.shape,
});

export type Merged = z.infer<typeof MergedSchema>;
```

`.extend()` 接受 shape 物件，右側欄位優先（等同覆蓋）；object spread 直接構造新 schema，在大型 monorepo 下 tsc 效能更佳。兩種寫法根據場景擇一，不要混用。

## 例外

若 `BaseSchema` 本身帶有 `.strict()` / `.passthrough()` 設定，`.extend()` 會繼承這些行為；object spread 則產生全新的 `z.object()`（預設 strip）。需要繼承原 schema 行為時，選用 `.extend()`。
