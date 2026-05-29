---
rule: api-to-json-schema
category: v4 新 API 採用
tags: [v4, json-schema, openapi, tool-use]
---

# 用 `z.toJSONSchema()` 產出 OpenAPI spec 或 AI tool input_schema

> v4 原生支援 JSON Schema 轉換，不需第三方套件，可直接用於 OpenAPI pipeline 或 Claude tool 定義。

## 原因

- `zod-to-json-schema` 等第三方套件需另行安裝與維護，且可能與 Zod 版本不同步
- v4 內建 `z.toJSONSchema()` 產出標準 JSON Schema Draft 7，零額外依賴
- 直接整合 AI tool `input_schema` 定義，避免手寫 JSON Schema 與 Zod schema 雙重維護

## ❌ Bad

```typescript
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema"; // 需安裝第三方套件

const CreatePostSchema = z.object({
  title: z.string().min(1),
  body: z.string(),
  published: z.boolean().optional(),
});

// 需依賴第三方轉換
const jsonSchema = zodToJsonSchema(CreatePostSchema);
```

第三方套件增加依賴負擔，且 v4 已內建此功能，繼續使用屬於冗餘依賴。

## ✅ Good

```typescript
import { z } from "zod";

const CreatePostSchema = z.object({
  title: z.string().min(1),
  body: z.string(),
  published: z.boolean().optional(),
});

// 直接轉換，無需第三方套件
const jsonSchema = z.toJSONSchema(CreatePostSchema);

// 用於 Claude tool input_schema
const tool = {
  name: "create_post",
  description: "建立一篇文章",
  input_schema: z.toJSONSchema(CreatePostSchema),
};

// 用於 OpenAPI spec
const openApiPath = {
  requestBody: {
    content: {
      "application/json": {
        schema: z.toJSONSchema(CreatePostSchema),
      },
    },
  },
};
```

`z.toJSONSchema()` 是 v4 的內建 API，schema 定義即為唯一真相來源，OpenAPI 與 AI tool 定義無需手寫。
