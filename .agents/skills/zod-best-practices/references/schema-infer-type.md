---
rule: schema-infer-type
category: Schema 設計
tags: [schema-design, z.infer, type-inference, single-source-of-truth]
---

# 以 z.infer 從 schema 推斷型別，不手寫 type

> Schema 是唯一真相來源，用 `z.infer<typeof Schema>` 取得對應型別，消除手寫 type 造成的雙重維護問題。

## 原因

- 手寫 type 後，schema 改變時需同步更新 type，容易遺漏而導致型別與執行時行為不一致。
- `z.infer` 直接從 schema 衍生，型別永遠與 schema 同步，不存在漂移風險。
- 減少冗餘程式碼，讓 schema 變更的影響範圍只有一處。

## ❌ Bad

```typescript
import { z } from 'zod';

// 手寫 type，與 schema 平行維護
type User = {
  id: string;
  name: string;
  age: number;
};

const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  age: z.number(),
});

// 若 schema 新增 email 欄位，User type 不會自動更新
// 兩份定義容易漂移
```

schema 與 type 各自獨立，新增或刪除欄位時必須同步修改兩處。

## ✅ Good

```typescript
import { z } from 'zod';

const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  age: z.number(),
});

// 從 schema 推斷型別，永遠同步
type User = z.infer<typeof UserSchema>;
// { id: string; name: string; age: number }

// 新增欄位只需改 schema，type 自動更新
const UpdatedUserSchema = UserSchema.extend({
  email: z.string(),
});

type UpdatedUser = z.infer<typeof UpdatedUserSchema>;
// { id: string; name: string; age: number; email: string }
```

`z.infer` 讓型別跟著 schema 走，schema 是唯一需要修改的地方。
