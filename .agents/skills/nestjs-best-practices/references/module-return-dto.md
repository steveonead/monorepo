---
rule: module-return-dto
category: 模組組織
tags: [module, dto, entity, security, serialization]
---

# Service Public Method 回傳 DTO，不直接回傳 Entity

> Service 的 public method 回傳型別明確宣告為 DTO，不回傳 ORM Entity。

## 原因

- Entity 可能含有 `passwordHash`、ORM metadata 等敏感欄位，明確映射至 DTO 能防止意外洩漏。
- 不依賴 `@Exclude()` decorator 或攔截器才能正確排除欄位，輸出欄位由程式碼明確控制。

## ❌ Bad

```typescript
import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findOne(id: string) {
    return this.prisma.user.findUnique({ where: { id } })
    // Prisma model 可能含有 passwordHash、deletedAt 等敏感欄位
  }
}
```

直接回傳 Prisma model，呼叫端可能在不知情的情況下序列化敏感欄位。

## ✅ Good

```typescript
import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { UserDto } from './dto/user.dto'

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findOne(id: string): Promise<UserDto> {
    const user = await this.prisma.user.findUnique({ where: { id } })
    if (!user) throw new NotFoundException(`User ${id} not found`)
    return {
      id: user.id,
      name: user.name,
      email: user.email,
    }
  }
}
```

明確映射到 DTO，輸出欄位由程式碼控制，不依賴 decorator 機制。

## 例外

若團隊選擇 `ClassSerializerInterceptor + @Exclude()` 路線（NestJS 官方支援），可在 Prisma model 的包裝 class 上以 decorator 排除敏感欄位並直接回傳，但須在模組中全域啟用攔截器且確保每個敏感欄位都有標注。
