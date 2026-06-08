---
rule: deprecated-coerce-input-type
category: 廢棄 API
tags: [deprecated, coerce, input, type, unknown]
---

# 禁用依賴 `z.coerce` schema 的 `z.input<>` 型別推斷

> v4 中所有 `z.coerce.*` schema 的 input type 統一改為 `unknown`，依賴 v3 具體型別推斷的用法靜默漂移。

## 原因

- v4 將所有 `z.coerce.*` 的 input type 統一為 `unknown`，v3 的具體型別（`string`、`number` 等）不再成立
- `z.input<typeof coerceSchema>` 在 v4 靜默回傳 `unknown`，若仍以 v3 的具體型別使用，TypeScript 不報錯但型別意圖已錯
- `z.coerce` 的用途是接受任意輸入後強制轉型，`unknown` 才是語意正確的 input type

## ❌ Bad

```typescript
import { z } from 'zod';

const AgeSchema = z.coerce.number();

// v3 推斷為 number，v4 推斷為 unknown — 靜默漂移
type AgeInput = z.input<typeof AgeSchema>;

// 若以 v3 假設使用，型別標記已與實際推斷不符
const processAge = (input: AgeInput) => {
  // v4 中 input 是 unknown，但此函式以 number 操作它
  return input * 2; // TypeScript 在 v4 會報錯（unknown 不能直接運算）
};
```

`z.input<typeof coerceSchema>` 在 v4 回傳 `unknown`，依賴 v3 具體型別的程式碼需要調整。

## ✅ Good

```typescript
import { z } from 'zod';

const AgeSchema = z.coerce.number();

// 方案一：直接使用 output type（parse 後的型別），不依賴 input type
type Age = z.output<typeof AgeSchema>; // number，v3/v4 一致

// 方案二：若需要標記傳入 parse 的參數型別，明確寫 unknown
function processRawAge(raw: unknown) {
  const result = AgeSchema.safeParse(raw);
  if (!result.success) return null;
  return result.data * 2; // result.data 是 number，型別正確
};
```

`z.coerce` 接受任意輸入並轉型，呼叫端傳入的參數標記為 `unknown` 語意最精確。若只需要 parse 後的型別，用 `z.output<>` 或 `z.infer<>` 即可。

## 例外

`z.coerce` 本身的使用不受影響，只有搭配 `z.input<>` 取得 input type 並以具體型別使用的模式需要調整。
