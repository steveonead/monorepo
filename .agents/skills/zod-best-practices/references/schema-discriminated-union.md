---
rule: schema-discriminated-union
category: Schema 設計
tags: [schema-design, discriminated-union, union, performance, error-message]
---

# 多型資料用 z.discriminatedUnion()，不用 z.union()

> 有 discriminator key 的多型資料用 `z.discriminatedUnion()`；`z.union()` 只在無法確定 discriminator 時使用。

## 原因

- `z.discriminatedUnion()` 先讀取 discriminator key 值，直接跳至對應 branch，時間複雜度 O(1)。
- `z.union()` 依序嘗試每個 branch，直到成功為止，branch 越多越慢，且失敗的 error message 包含所有 branch 的錯誤，難以閱讀。
- v4 起 `z.discriminatedUnion()` 支援巢狀組合，多層多型結構不需降格使用 `z.union()`。

## ❌ Bad

```typescript
import { z } from 'zod';

// 有 type discriminator，卻用 z.union()
const EventSchema = z.union([
  z.object({ type: z.literal('click'), x: z.number(), y: z.number() }),
  z.object({ type: z.literal('keydown'), key: z.string() }),
  z.object({ type: z.literal('scroll'), delta: z.number() }),
]);
```

解析時逐一嘗試每個 branch，失敗時錯誤訊息混雜三個 branch 的問題，難以定位真正錯誤。

## ✅ Good

```typescript
import { z } from 'zod';

// 有 discriminator key，使用 z.discriminatedUnion()
const EventSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('click'), x: z.number(), y: z.number() }),
  z.object({ type: z.literal('keydown'), key: z.string() }),
  z.object({ type: z.literal('scroll'), delta: z.number() }),
]);

type Event = z.infer<typeof EventSchema>;

// v4：discriminated unions 可巢狀組合
const PointerEventSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('mouse'), button: z.number() }),
  z.object({ kind: z.literal('touch'), touchId: z.string() }),
]);

const InputSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('pointer'), ...PointerEventSchema.def }),
  z.object({ type: z.literal('keyboard'), key: z.string() }),
]);
```

依 discriminator key 直接路由至正確 branch，錯誤訊息精確，效能恆定。

## 例外

當各 branch 沒有共同的 discriminator key，或 discriminator 值本身不是 literal（如動態值），才退回 `z.union()`。
