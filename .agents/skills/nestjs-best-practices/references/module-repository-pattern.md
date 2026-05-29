---
rule: module-repository-pattern
category: 模組組織
tags: [module, repository, dependency-injection, testability, DDD]
---

# Service 依賴 Repository 介面，不直接耦合 ORM 實作

> 以 Symbol injection token 定義 Repository 型別，Service 依賴抽象，不直接注入 ORM 的 `Repository<Entity>`。

## 原因

- 測試時可將 Repository 替換為 in-memory 實作，不需啟動資料庫。
- ORM 版本升級或資料庫遷移時，只需改 Repository 實作，Service 不受影響。

## ❌ Bad

```typescript
import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findOne(id: string) {
    return this.prisma.user.findUnique({ where: { id } })
  }
}
```

Service 直接耦合 PrismaService，未來換 ORM 或需要 in-memory 測試時必須修改 Service。

## ✅ Good

```typescript
import { Inject, Injectable } from '@nestjs/common'
import { CreateUserDto } from './dto/create-user.dto'
import { UserDto } from './dto/user.dto'

export const USERS_REPOSITORY = Symbol('USERS_REPOSITORY')

export type UsersRepository = {
  findById: (id: string) => Promise<UserDto | null>
  save: (user: CreateUserDto) => Promise<UserDto>
}

@Injectable()
export class UsersService {
  constructor(
    @Inject(USERS_REPOSITORY)
    private readonly repo: UsersRepository,
  ) {}

  async findOne(id: string): Promise<UserDto | null> {
    return this.repo.findById(id)
  }
}

// users.module.ts 中切換實作：
// { provide: USERS_REPOSITORY, useClass: PrismaUsersRepository }

// 測試中替換為 in-memory 實作：
// { provide: USERS_REPOSITORY, useValue: inMemoryUsersRepository }
```

Service 只知道 `UsersRepository` 型別，實作由 Module 注入，測試時可輕鬆替換。

## 例外

若專案規模小、不打算換 ORM、也不需要 in-memory 測試替換，可直接在 Service 中注入 `PrismaService`。
