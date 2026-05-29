---
rule: dto-meta-openapi-ref
category: DTO
tags: [dto, zod, openapi, swagger, schema]
---

# Zod v4 以 `.meta({ id: 'Name' })` 為 schema 建立具名 OpenAPI `$ref`

> 加上 `id` 後 Swagger 文件建立共用 `$ref`，多端點引用同一 schema 不重複展開。

## 原因

- 無 `id` 時 nestjs-zod 將 schema 內聯展開，多個端點引用同一 schema 會重複定義。
- `.meta({ id })` 在 `components/schemas/Name` 建立共用定義，Swagger UI 顯示更清晰。
- shared package 的 schema 保持純驗證邏輯，OpenAPI metadata 只在應用層疊加，不污染共用 schema。

## ❌ Bad

```typescript
import { z } from 'zod'
import { createZodDto } from 'nestjs-zod'

// Zod v3 的舊寫法，v4 不適用
const UserSchema = z.object({
  id: z.uuid(),
  name: z.string(),
}).describe('User')

export class UserDto extends createZodDto(UserSchema) {}
```

`.describe()` 在 Zod v4 不產生具名 `$ref`，多端點引用時 schema 仍會重複展開。

## ✅ Good

```typescript
import { z } from 'zod'
import { createZodDto } from 'nestjs-zod'

// shared package：純驗證邏輯，不帶 OpenAPI metadata
export const UserSchema = z.object({
  id: z.uuid(),
  name: z.string(),
})

// NestJS 應用層：wrap 時疊加 OpenAPI metadata
export class UserDto extends createZodDto(
  UserSchema.meta({ id: 'User' })
) {}
```

`.meta({ id: 'User' })` 在應用層疊加，shared package 保持乾淨，Swagger 文件產生具名 `$ref`。

## 例外

prototype 或一次性端點若不需要 Swagger 文件，可省略 `.meta({ id })`。
