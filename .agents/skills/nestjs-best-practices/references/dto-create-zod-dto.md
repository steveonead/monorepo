---
rule: dto-create-zod-dto
category: DTO
tags: [dto, zod, validation, openapi]
---

# 以 `createZodDto(schema)` 取代 class-validator DTO

> Zod schema 是唯一真相來源，同時產生型別、執行期驗證與 OpenAPI 文件。

## 原因

- class-validator 需分開宣告 class 與型別，維護兩份定義容易 diverge。
- `z.infer<typeof Schema>` 自動推斷 TypeScript 型別，不需手寫 interface。
- `ZodValidationPipe` 在執行期驗證；nestjs-zod 的 Swagger plugin 整合會自動識別 `createZodDto` 產生的 class，無需手動標註 `@ApiBody()`。

## ❌ Bad

```typescript
import { IsString, IsEmail } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class CreateUserDto {
  @ApiProperty()
  @IsString()
  name: string

  @ApiProperty()
  @IsEmail()
  email: string
}
```

class 宣告、型別宣告、Swagger 標註三者分離，修改欄位時必須同步三處。

## ✅ Good

```typescript
import { z } from 'zod'
import { createZodDto } from 'nestjs-zod'

const CreateUserSchema = z.object({
  name: z.string(),
  email: z.email(),
})

export class CreateUserDto extends createZodDto(CreateUserSchema) {}
```

schema 是唯一真相來源，型別推斷、執行期驗證、Swagger 文件皆從此處自動產生。
