---
rule: deprecated-zod-to-json-schema
category: 廢棄 API
tags: [deprecated, json-schema, zod-to-json-schema]
---

# 禁用第三方套件 `zod-to-json-schema`，改用 `z.toJSONSchema()`

> v4 原生支援 JSON Schema 轉換，不需安裝 `zod-to-json-schema`；直接呼叫 `z.toJSONSchema(schema)` 即可。

## 原因

- v4 已將 JSON Schema 轉換納入核心，第三方套件成為不必要的依賴
- 減少 `package.json` 依賴，降低版本衝突與維護成本
- `z.toJSONSchema()` 與 Zod 版本完全同步，不需另外追蹤相容性

## ❌ Bad

```ts
import { zodToJsonSchema } from "zod-to-json-schema"; // 第三方套件
import { z } from "zod";

const UserSchema = z.object({
  id: z.string(),
  age: z.number().int(),
});

const jsonSchema = zodToJsonSchema(UserSchema); // 不必要的套件依賴
```

安裝額外套件只為做 Zod 核心已內建的事，且 `zod-to-json-schema` 可能落後 Zod v4 的新 schema 類型支援。

## ✅ Good

```ts
import { z } from "zod";

const UserSchema = z.object({
  id: z.string(),
  age: z.number().int(),
});

const jsonSchema = z.toJSONSchema(UserSchema);
```

`z.toJSONSchema()` 為 v4 內建函式，無需額外安裝，直接輸出符合 JSON Schema Draft 7 的物件，可直接用於 OpenAPI spec 或 AI tool 定義。
