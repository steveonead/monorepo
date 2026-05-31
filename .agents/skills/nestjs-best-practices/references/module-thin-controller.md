---
rule: module-thin-controller
category: 模組組織
tags: [module, controller, service, separation-of-concerns]
---

# Controller 只轉發請求，業務邏輯移至 Service

> Controller 只負責接收請求、呼叫 Service、回傳 DTO，業務邏輯一律移至 Service。

## 原因

- Controller 包含業務邏輯後難以單元測試，需要啟動完整 HTTP 上下文。
- 業務邏輯留在 Service 才能被多個 Controller 或排程任務複用。

## ❌ Bad

```typescript
import { Body, ConflictException, Post } from '@nestjs/common'
import * as bcrypt from 'bcrypt'
import { CreateUserDto } from './dto/create-user.dto'
import { UsersService } from './users.service'

const BCRYPT_SALT_ROUNDS = 10

@Post()
async create(@Body() dto: CreateUserDto) {
  const existing = await this.usersService.findByEmail(dto.email)
  if (existing) {
    throw new ConflictException('Email already in use')
  }
  const hashed = await bcrypt.hash(dto.password, BCRYPT_SALT_ROUNDS)
  return this.usersService.create({ ...dto, password: hashed })
}
```

重複驗證與雜湊邏輯散落在 Controller，無法在其他地方複用。

## ✅ Good

```typescript
import { Body, Controller, Post } from '@nestjs/common'
import { CreateUserDto } from './dto/create-user.dto'
import { UserDto } from './dto/user.dto'
import { UsersService } from './users.service'

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(@Body() dto: CreateUserDto): Promise<UserDto> {
    return this.usersService.create(dto)
  }
}
```

Controller 只做轉發，所有業務邏輯（驗證 email 重複、雜湊密碼）集中在 Service。
