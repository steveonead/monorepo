---
rule: schema-recursive-getter
category: Schema 設計
tags: [schema-design, recursive, getter, z.lazy, depth-limit]
---

# v4 遞迴 schema 優先用 getter 語法，捨棄 z.lazy()

> v4 起可在 `z.object()` 內用 getter 直接定義遞迴型別，結果是完整的 `ZodObject`，支援所有 method；`z.lazy()` 僅在必要時作為退路，且務必加 maxDepth 防護。

## 原因

- `z.lazy()` 回傳 `ZodLazy` 而非 `ZodObject`，無法直接鏈接 `.extend()`、`.pick()` 等 method，需額外型別轉換。
- getter 語法在 v4 中可直接引用自身，無需包裝，且保留完整 `ZodObject` 能力。
- 若仍使用 `z.lazy()`，惡意深層輸入可能造成 stack overflow，缺少 maxDepth refinement 是安全風險。

## ❌ Bad

```typescript
import { z } from 'zod';

// v3 寫法：z.lazy() + 型別轉換
type Category = {
  name: string;
  children: Category[];
};

const CategorySchema: z.ZodType<Category> = z.lazy(() =>
  z.object({
    name: z.string(),
    children: z.array(CategorySchema),
  })
);

// ZodLazy 無法直接 .extend()，需要額外處理
// 且沒有 maxDepth 防護
```

`z.lazy()` 的回傳型別是 `ZodLazy<T>`，鏈接 `.extend()` 等 method 會報型別錯誤，需要強制轉型繞過。

## ✅ Good

```typescript
import { z } from 'zod';

// v4：getter 語法直接定義遞迴型別
const CategorySchema = z.object({
  name: z.string(),
  // getter 直接引用自身，回傳仍是 ZodObject
  get children(): z.ZodArray<typeof CategorySchema> {
    return z.array(CategorySchema);
  },
});

type Category = z.infer<typeof CategorySchema>;
// { name: string; children: Category[] }

// 仍可使用所有 ZodObject method
const SlimCategorySchema = CategorySchema.pick({ name: true });
```

若仍需 `z.lazy()`（如跨 module 相互引用），加 maxDepth refinement 防止 stack overflow：

```typescript
import { z } from 'zod';

type TreeNode = {
  value: number;
  children: TreeNode[];
};

const MAX_DEPTH = 10;

const makeTreeSchema = (depth: number): z.ZodType<TreeNode> =>
  depth >= MAX_DEPTH
    ? z.object({ value: z.number(), children: z.array(z.never()) })
    : z.object({
        value: z.number(),
        children: z.array(z.lazy(() => makeTreeSchema(depth + 1))),
      });

export const TreeSchema = makeTreeSchema(0);
```

maxDepth 限制確保惡意深層輸入無法觸發 stack overflow。
