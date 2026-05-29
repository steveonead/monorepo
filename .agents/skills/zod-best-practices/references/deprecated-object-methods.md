---
rule: deprecated-object-methods
category: 廢棄 API
tags: [deprecated, passthrough, strict, strip, nonstrict, looseObject, strictObject]
---

# 禁用 `.passthrough()` / `.strict()` / `.strip()`，改用頂層 object 函式

> 方法鏈形式在 v4 deprecated；`.nonstrict()` 已完全 REMOVED。改用語意更明確的頂層函式。

## 原因

- `.passthrough()` / `.strict()` / `.strip()` 在 v4 deprecated（保留 backward compat，但視為 legacy 寫法）
- `.nonstrict()` 在 v4 已完全 REMOVED，沿用會 runtime 或 TypeScript 報錯
- 頂層函式（`z.looseObject()` / `z.strictObject()`）在 schema 定義時即表達意圖，不需額外鏈結方法

## ❌ Bad

```typescript
import { z } from "zod";

// method 鏈形式 — v4 deprecated / removed
const looseSchema = z.object({ name: z.string() }).passthrough();
const strictSchema = z.object({ name: z.string() }).strict();
const stripSchema = z.object({ name: z.string() }).strip();
const nonstrictSchema = z.object({ name: z.string() }).nonstrict(); // v4 REMOVED
```

`.passthrough()` / `.strict()` / `.strip()` 為 legacy 寫法；`.nonstrict()` 直接在 v4 移除。

## ✅ Good

```typescript
import { z } from "zod";

// 頂層函式 — v4 推薦
// 允許未知欄位通過（取代 .passthrough()）
const looseSchema = z.looseObject({ name: z.string() });

// 拒絕未知欄位（取代 .strict()）
const strictSchema = z.strictObject({ name: z.string() });

// 預設 strip 行為（取代 .strip()，也是 .nonstrict() 的替換）
const schema = z.object({ name: z.string() });

export type LooseData = z.infer<typeof looseSchema>;
export type StrictData = z.infer<typeof strictSchema>;
```

三種頂層函式語意一目了然，定義階段即鎖定行為，不依賴後綴方法鏈。

## 例外

若舊版 code 因 backward compat 暫時保留 `.passthrough()` / `.strict()` / `.strip()`，不強制立即遷移，但新寫的 schema 一律使用頂層函式。
