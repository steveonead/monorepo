---
rule: api-literal-multi-value
category: v4 新 API 採用
tags: [v4, literal, union, multi-value]
---

# 用 `z.literal()` 多值語法取代 union of literals

> v4 起 `z.literal()` 可接受值的陣列，語意更清楚且不需 `z.union()` 包裝。

## 原因

- `z.union([z.literal("a"), z.literal("b")])` 語意冗餘，閱讀噪音高
- v4 的 `z.literal(["a", "b"])` 等價且更簡潔，意圖一目了然
- 減少巢狀層數，schema 結構更扁平

## ❌ Bad

```typescript
import { z } from "zod";

// union of literals — 冗餘巢狀
const StatusSchema = z.union([
  z.literal("active"),
  z.literal("inactive"),
  z.literal("pending"),
]);

const DirectionSchema = z.union([
  z.literal("north"),
  z.literal("south"),
  z.literal("east"),
  z.literal("west"),
]);
```

每個值都需要獨立的 `z.literal()` 呼叫再包進 `z.union()`，冗餘且難以快速瀏覽可選值。

## ✅ Good

```typescript
import { z } from "zod";

// v4 多值 literal — 簡潔直觀
const StatusSchema = z.literal(["active", "inactive", "pending"]);

const DirectionSchema = z.literal(["north", "south", "east", "west"]);

type Status = z.infer<typeof StatusSchema>; // "active" | "inactive" | "pending"
type Direction = z.infer<typeof DirectionSchema>; // "north" | "south" | "east" | "west"
```

陣列形式讓所有可選值集中在同一行，型別推斷結果與 `z.union()` 版本相同。
