---
rule: deprecated-error-map
category: 廢棄 API
tags: [deprecated, errorMap, error, custom-error]
---

# 禁用 `errorMap` 參數，改用 `error`

> `errorMap` 在 v4 重命名為 `error`，且新的 `error` 函式 API 更簡潔：可直接回傳 `string`。

## 原因

- `errorMap` 已在 v4 重命名為 `error`，舊名稱 deprecated
- 舊 `errorMap` 必須回傳 `{ message: string }`，新 `error` 可直接回傳 `string`，減少樣板程式碼
- `error` 函式回傳 `undefined` 代表委派給下一層 error map，語意比舊 API 更明確

## ❌ Bad

```typescript
import { z } from "zod";

// errorMap — v4 deprecated
const schema = z.string({
  errorMap: (issue, ctx) => ({
    message: issue.code === "too_small" ? "太短了" : ctx.defaultError,
  }),
});
```

`errorMap` 名稱在 v4 deprecated，且強迫包裝 `{ message: ... }` 是多餘的。

## ✅ Good

```typescript
import { z } from "zod";

// error — v4 推薦
const schema = z.string({
  error: (issue) => {
    if (issue.code === "too_small") return "太短了";
    return undefined; // 回傳 undefined 交由下一層處理
  },
});

// 靜態字串可直接傳
const required = z.string({ error: "此欄位為必填" });
```

`error` 函式可直接回傳 `string` 或 `undefined`，更乾淨，且與 `required_error` / `invalid_type_error` 的替換方案統一。
