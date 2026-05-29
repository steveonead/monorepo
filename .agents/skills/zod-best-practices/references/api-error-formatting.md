---
rule: api-error-formatting
category: v4 新 API 採用
tags: [v4, error, prettifyError, treeifyError, format, flatten]
---

# 用 `z.prettifyError()` / `z.treeifyError()` 格式化錯誤，取代 deprecated `.format()` / `.flatten()`

> v4 deprecated `ZodError` 上的 `.format()` 與 `.flatten()`，改用頂層函式；依使用場景選擇 `prettifyError` 或 `treeifyError`，兩者功能不同。

## 原因

- `ZodError.prototype.format()` 與 `.flatten()` 在 v4 已標記 deprecated，未來版本將移除
- `z.prettifyError()` 產出人類可讀的多行字串，適合 logging 與開發除錯
- `z.treeifyError()` 產出結構化樹狀物件，適合程式碼處理 error 結構，功能接近舊版 `.format()` / `.flatten()`，但輸出格式更統一

## ❌ Bad

```typescript
import { z } from "zod";

const schema = z.object({
  email: z.email(),
  age: z.number().min(0),
});

const result = schema.safeParse({ email: "bad", age: -1 });

if (!result.success) {
  // v4 deprecated，未來版本將移除
  const formatted = result.error.format();
  const flat = result.error.flatten();
}
```

`.format()` 與 `.flatten()` 是 instance method，v4 已 deprecated，且直接呼叫在日後升版時會靜默損壞。

## ✅ Good

```typescript
import { z } from "zod";

const schema = z.object({
  email: z.email(),
  age: z.number().min(0),
});

const result = schema.safeParse({ email: "bad", age: -1 });

if (!result.success) {
  // 場景 1：logging / 開發除錯 — 人類可讀字串
  const message = z.prettifyError(result.error);
  console.error(message);
  // 輸出：
  // ✖ Invalid email address at "email"
  // ✖ Number must be greater than or equal to 0 at "age"

  // 場景 2：程式碼處理 error 結構 — 結構化樹狀物件
  const tree = z.treeifyError(result.error);
  // tree.properties.email._errors → string[]
  // tree.properties.age._errors → string[]
}
```

兩者職責不同：`prettifyError` 給人看，`treeifyError` 給程式碼處理。依場景選擇，不混用。

## 例外

若僅需取得根層級 error messages（無巢狀），可直接讀 `result.error.issues`，無需任何格式化函式。
