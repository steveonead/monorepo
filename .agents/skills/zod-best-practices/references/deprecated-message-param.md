---
rule: deprecated-message-param
category: 廢棄 API
tags: [deprecated, message, error, validation-params]
---

# 禁用 `{ message: '...' }` 參數，改用 `{ error: '...' }`

> `.min()` / `.max()` / `.regex()` 等驗證方法的 `message` 選項在 v4 deprecated，改用 `error`。

## 原因

- `message` 選項在 v4 deprecated，與 `errorMap` → `error` 的改名方向一致
- 統一使用 `error` 讓所有自訂錯誤訊息的入口保持一致，降低記憶負擔
- `error` 同時支援靜態字串與動態函式，彈性更高

## ❌ Bad

```typescript
import { z } from "zod";

// message 參數 — v4 deprecated
const schema = z.string()
  .min(5, { message: "至少 5 個字元" })
  .max(100, { message: "最多 100 個字元" })
  .regex(/^[a-z]+$/, { message: "只允許小寫英文字母" });
```

`{ message: '...' }` 寫法在 v4 deprecated，建議儘早遷移。

## ✅ Good

```typescript
import { z } from "zod";

// error 參數 — v4 推薦
const schema = z.string()
  .min(5, { error: "至少 5 個字元" })
  .max(100, { error: "最多 100 個字元" })
  .regex(/^[a-z]+$/, { error: "只允許小寫英文字母" });

// error 也支援動態函式
const dynamicSchema = z.string().min(5, {
  error: (issue) => `至少需要 5 個字元，目前只有 ${String(issue.input).length} 個`,
});
```

`{ error: '...' }` 與整體 v4 error API 保持一致，靜態字串與動態函式皆支援。
