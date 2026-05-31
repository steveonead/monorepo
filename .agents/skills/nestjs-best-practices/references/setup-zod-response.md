---
rule: setup-zod-response
category: setup
tags: [setup, response, openapi, serialization, zod, decorator]
---

# 以 @ZodResponse 取代 @ApiResponse + @ZodSerializerDto 的組合

> 前提：需已安裝 @nestjs/swagger

> 一個 decorator 同時完成 runtime 序列化、OpenAPI 文件、TypeScript 型別檢查，三者不會脫鉤。

## 原因

- 分開寫 `@ApiResponse` 與 `@ZodSerializerDto` 時，容易只套其中一個，導致文件與實際回應不一致。
- `@ZodResponse` 自動使用 schema 的 output 版本（transform 後的型別），型別檢查與 runtime 行為保持同步。

## ❌ Bad

```typescript
// users.controller.ts
import { Controller, Get, Param } from '@nestjs/common';
import { ApiOkResponse } from '@nestjs/swagger';
import { ZodSerializerDto } from 'nestjs-zod';
import { UserDto } from './user.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // 兩個 decorator 必須同時存在，遺漏任一個都不會有編譯錯誤
  @Get(':id')
  @ApiOkResponse({ type: UserDto })
  @ZodSerializerDto(UserDto)
  async findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }
}
```

若移除 `@ZodSerializerDto(UserDto)`，Swagger 文件正確但 runtime 不序列化；反之若移除 `@ApiOkResponse`，序列化正確但文件錯誤。

## ✅ Good

```typescript
// users.controller.ts
import { Controller, Get, Param } from '@nestjs/common';
import { ZodResponse } from 'nestjs-zod';
import { UserDto } from './user.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get(':id')
  @ZodResponse({ type: UserDto })
  async findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }
}
```

`@ZodResponse` 單一 decorator 整合序列化、OpenAPI 文件與型別推斷，三者永遠同步，無法只套一半。
