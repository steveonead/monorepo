---
rule: dto-compose-with-schema
category: DTO
tags: [dto, zod, composition, schema]
---

# 以 `DTO.schema.omit/pick/extend` 組合衍生 DTO，不重寫 schema

> 從既有 DTO 的 schema 衍生，修改原 schema 時衍生 DTO 自動跟進。

## 原因

- 手動重寫 schema 會讓兩份定義各自演化，日後欄位不一致難以發現。
- `CreateUserDto.schema.partial()` 等 Zod 方法保持與原 schema 的連結。
- 衍生關係明確表達 DTO 之間的語意關聯，閱讀時一目了然。

## ❌ Bad

```typescript
import { z } from 'zod'
import { createZodDto } from 'nestjs-zod'

// 重寫 schema，與 CreateUserSchema 的欄位可能不一致
const UpdateUserSchema = z.object({
  name: z.string().optional(),
  email: z.email().optional(),
})

export class UpdateUserDto extends createZodDto(UpdateUserSchema) {}
```

重寫 schema 時若漏掉欄位或型別不一致，編譯器不會報錯。

## ✅ Good

```typescript
import { createZodDto } from 'nestjs-zod'
import { CreateUserDto } from './create-user.dto'
import { UserDto } from './user.dto'

// partial() 讓所有欄位變成 optional，自動與 CreateUserSchema 同步
export class UpdateUserDto extends createZodDto(
  CreateUserDto.schema.partial()
) {}

// omit() 移除敏感欄位，自動與 UserSchema 同步
export class UserResponseDto extends createZodDto(
  UserDto.schema.omit({ password: true })
) {}
```

衍生 DTO 透過 schema 方法明確宣告與原 DTO 的差異，修改原 schema 時自動同步。
