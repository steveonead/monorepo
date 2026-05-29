---
rule: dto-shared-package
category: DTO
tags: [dto, zod, monorepo, shared-package, frontend]
---

# monorepo 中 Zod schema 放獨立 shared package，前後端共用

> shared package 只放純 Zod 驗證邏輯，NestJS metadata 在應用層疊加。

## 原因

- Next.js 表單驗證與 NestJS API 驗證使用同一份 schema，修改一處全局生效。
- shared package 帶入 `nestjs-zod` 依賴會污染前端 bundle，且無法在 Node.js 以外環境執行。
- OpenAPI metadata（`.meta({ id })`）只在 NestJS 應用層疊加，不寫進 shared package。

## ❌ Bad

```typescript
// packages/shared/src/user.schema.ts
import { z } from 'zod'
import { createZodDto } from 'nestjs-zod'  // 帶入 NestJS 依賴，前端無法使用

export const UserSchema = z.object({ name: z.string() })
export class UserDto extends createZodDto(UserSchema) {}
```

shared package 依賴 `nestjs-zod` 導致前端 bundle 包含後端套件，且 tree-shaking 無法移除。

## ✅ Good

```typescript
// packages/shared/src/schemas/user.schema.ts
import { z } from 'zod'

export const UserSchema = z.object({
  name: z.string(),
  email: z.email(),
})

export type User = z.infer<typeof UserSchema>
```

```typescript
// apps/api/src/user/user.dto.ts（NestJS 應用層 wrap）
import { z } from 'zod'
import { createZodDto } from 'nestjs-zod'
import { UserSchema } from '@company/shared'

export class UserDto extends createZodDto(
  UserSchema.meta({ id: 'User' })
) {}
```

shared package 只依賴 `zod`，前後端皆可引用；NestJS 相關邏輯封裝在應用層，職責清晰。
