---
rule: schema-strict-object
category: Schema 設計
tags: [schema-design, strictObject, object, unknown-keys, api-boundary]
---

# 需拒絕未知欄位的場景用 z.strictObject()

> 公開 API 邊界或需要嚴格驗證輸入結構時，用 `z.strictObject()` 取代 `z.object()`；內部資料結構不強制 strict。

## 原因

- `z.object()` 預設靜默丟棄未知欄位（strip mode），多傳的欄位不會報錯，輸入可悄悄包含非預期資料。
- `z.strictObject()` 直接拒絕含未知欄位的輸入，讓呼叫端明確知道 API 契約邊界。
- 內部資料結構過度使用 strict 會讓 forward-compatible 擴充變困難：新增欄位時，所有呼叫端必須同步更新。

## ❌ Bad

```typescript
import { z } from 'zod';

// 公開 API endpoint 的 body schema — 使用 z.object() 靜默忽略未知欄位
const CreateUserSchema = z.object({
  name: z.string(),
  email: z.string(),
});

// 呼叫端傳入 { name, email, role: 'admin' }
// role 被靜默丟棄，不報錯 — 可能掩蓋客戶端 bug 或惡意輸入
```

靜默丟棄未知欄位可能讓呼叫端誤以為欄位已被接受並生效。

## ✅ Good

```typescript
import { z } from 'zod';

// 公開 API 邊界 — 明確拒絕未知欄位
export const CreateUserSchema = z.strictObject({
  name: z.string(),
  email: z.string(),
});

// 呼叫端傳入 { name, email, role: 'admin' }
// → 驗證失敗，回傳 400，明確告知 role 是未知欄位

// 內部資料傳遞 — 不需 strict，允許後續擴充
const UserRecordSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  // 未來新增欄位時，舊的 parse 呼叫不受影響
});
```

`z.strictObject()` 集中用於對外邊界，內部 schema 保持 `z.object()` 以利擴充。

## 例外

當系統需要在多個版本間維持 forward compatibility（如事件流、plugin 架構），即使是對外邊界也應使用 `z.object()` 並忽略未知欄位，以免升級時產生 breaking change。
