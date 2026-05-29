---
rule: setup-global-interceptor
category: setup
tags: [setup, interceptor, serialization, zod, security]
---

# 以 APP_INTERCEPTOR 全域註冊 ZodSerializerInterceptor

> 全域掛載序列化攔截器，確保每個回應都經 Zod schema 過濾，防止敏感欄位洩漏。

## 原因

- 直接回傳 entity 物件，`password`、內部 ID 等敏感欄位可能意外出現在回應中。
- 全域掛載保證不遺漏任何端點，不依賴開發者逐一手動套用。

## ❌ Bad

```typescript
// users.controller.ts
import { Controller, Get } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get(':id')
  async findOne(id: string) {
    // 直接回傳 entity，password hash 與內部欄位一併送出
    return this.usersService.findOne(id);
  }
}
```

entity 包含 `passwordHash`、`internalRole` 等欄位，全數序列化至 JSON 回應。

## ✅ Good

```typescript
// app.module.ts
import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ZodSerializerInterceptor } from 'nestjs-zod';

@Module({
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: ZodSerializerInterceptor,
    },
  ],
})
export class AppModule {}
```

全域註冊後，宣告回應 DTO 的端點都會經 Zod schema 序列化，只輸出 schema 定義的欄位，敏感資料不會外洩。
