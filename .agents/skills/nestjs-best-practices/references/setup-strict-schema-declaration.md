---
rule: setup-strict-schema-declaration
category: setup
tags: [setup, validation, zod, strict-mode, migration]
---

# 完成所有 DTO 遷移後啟用 strictSchemaDeclaration 強制全面 Zod 驗證

> 所有端點的 DTO 替換完成後，才開啟嚴格模式，確保沒有任何輸入繞過 Zod 驗證。

## 原因

- 預設模式下，未套用 nestjs-zod DTO 的端點會靜默跳過驗證，安全漏洞不會被察覺。
- 嚴格模式開啟後，請求進入未標註 Zod DTO 的 `@Body()`、`@Query()`、`@Param()` 端點時，會拋 `ZodSchemaDeclarationException` 並回應 500，強制修正。

## ❌ Bad

```typescript
// app.module.ts — 直接使用 ZodValidationPipe，未開啟嚴格模式
import { Module } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';
import { ZodValidationPipe } from 'nestjs-zod';

@Module({
  providers: [
    {
      provide: APP_PIPE,
      useClass: ZodValidationPipe,
    },
  ],
})
export class AppModule {}
```

```typescript
// users.controller.ts — 用 primitive type 標註，靜默跳過驗證
import { Controller, Get, Query } from '@nestjs/common';

@Controller('users')
export class UsersController {
  @Get()
  findAll(@Query('role') role: string) {
    // role 未經任何 Zod 驗證，傳入任意值都不會報錯
    return [];
  }
}
```

`role` 為 primitive type，非 nestjs-zod DTO，驗證被靜默跳過。

## ✅ Good

```typescript
// app.module.ts — 完成所有 DTO 遷移後啟用嚴格模式
import { Module } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';
import { createZodValidationPipe } from 'nestjs-zod';

const StrictZodValidationPipe = createZodValidationPipe({
  strictSchemaDeclaration: true,
});

@Module({
  providers: [
    {
      provide: APP_PIPE,
      useClass: StrictZodValidationPipe,
    },
  ],
})
export class AppModule {}
```

```typescript
// find-users.query.dto.ts
import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

const FindUsersQuerySchema = z.object({
  role: z.string().optional(),
});

export class FindUsersQueryDto extends createZodDto(FindUsersQuerySchema) {}
```

```typescript
// users.controller.ts
import { Controller, Get, Query } from '@nestjs/common';
import { FindUsersQueryDto } from './find-users.query.dto';

@Controller('users')
export class UsersController {
  @Get()
  findAll(@Query() query: FindUsersQueryDto) {
    return [];
  }
}
```

所有 `@Query()` 標註 Zod DTO，嚴格模式確保沒有端點遺漏。

## 例外

遷移期間保持 `strictSchemaDeclaration: false`（預設值），待所有端點替換完成再開啟，避免服務中斷。
