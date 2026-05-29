---
rule: schema-super-refine
category: Schema 設計
tags: [schema-design, superRefine, refine, validation, multiple-errors]
---

# 多個 validation error 用 .superRefine()，單一檢查用 .refine()

> `.refine()` 只能產生一個 error；`.superRefine()` 可呼叫多次 `ctx.addIssue()` 同時回報多個問題。v4 中 `ctx.path` 已移除，勿在 `.superRefine()` 內存取。

## 原因

- `.refine()` 回傳 `boolean`，無論多少個問題都只能產生一條 error，使用者需多次提交才能看到所有問題。
- `.superRefine()` 允許在一次驗證中呼叫多次 `ctx.addIssue()`，一次回報所有 validation error。
- v4 移除了 `ctx.path`，若存取 `ctx.path` 會在 runtime 拿到 `undefined`，不報 TypeScript 錯誤但行為靜默錯誤。

## ❌ Bad

```typescript
import { z } from 'zod';

const PasswordSchema = z.object({
  password: z.string(),
  confirmPassword: z.string(),
}).refine((data) => {
  // .refine() 只能回報一個錯誤
  // 若 password 長度不足 AND 兩者不一致，只能看到一個問題
  return data.password.length >= 8 && data.password === data.confirmPassword;
}, {
  error: '密碼不符合規則',
});
```

使用者看到的只有一條泛用訊息，無法同時得知「長度不足」和「確認密碼不符」兩個問題。

```typescript
import { z } from 'zod';

// v4 中 ctx.path 已移除，這樣寫靜默錯誤
const BadSchema = z.string().superRefine((val, ctx) => {
  if (val.length < 8) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: '長度不足',
      path: ctx.path, // v4 中 ctx.path 不存在，undefined
    });
  }
});
```

## ✅ Good

```typescript
import { z } from 'zod';

const PasswordSchema = z.object({
  password: z.string(),
  confirmPassword: z.string(),
}).superRefine((data, ctx) => {
  // 多個獨立檢查，各自回報 error
  if (data.password.length < 8) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: '密碼長度至少 8 個字元',
      path: ['password'],
    });
  }

  if (data.password !== data.confirmPassword) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: '確認密碼與密碼不符',
      path: ['confirmPassword'],
    });
  }
  // 兩個問題會同時回報，使用者一次看到所有錯誤
});

// 單一條件檢查 — .refine() 足夠且更簡潔
const PositiveNumberSchema = z.number().refine(
  (n) => n > 0,
  { error: '必須是正數' }
);
```

`.superRefine()` 搭配明確的 `path` 陣列，讓每個 error 對應到正確欄位；`.refine()` 保留給單一條件的簡潔表達。
