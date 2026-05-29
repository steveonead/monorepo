---
rule: deprecated-required-error
category: 廢棄 API
tags: [deprecated, required_error, invalid_type_error, error]
---

# 禁用 `required_error` / `invalid_type_error`，改用 `error` 函式

> 兩個選項在 v4 已完全移除（DROPPED），必須改用 `error` 函式，以 `issue.input === undefined` 區分空值錯誤。

## 原因

- `required_error` 與 `invalid_type_error` 在 v4 是 DROPPED（非 deprecated），沿用舊寫法會靜默失效或 TypeScript 報錯
- `error` 函式統一處理所有錯誤類型，透過 `issue.input` 判斷情境，API 一致性更高
- 兩個選項拆開維護容易遺漏其中一個，`error` 函式集中在同一處更易管理

## ❌ Bad

```typescript
import { z } from "zod";

// required_error / invalid_type_error — v4 已移除
const schema = z.string({
  required_error: "此欄位為必填",
  invalid_type_error: "必須為字串",
});
```

v4 已完全移除這兩個選項，TypeScript 會報型別錯誤，執行時自訂訊息也不會生效。

## ✅ Good

```typescript
import { z } from "zod";

// error 函式統一處理
const schema = z.string({
  error: (issue) => {
    if (issue.input === undefined) return "此欄位為必填";
    return "必須為字串";
  },
});
```

以 `issue.input === undefined` 判斷是否為空值，其餘情況視為型別錯誤，語意明確且 API 統一。
