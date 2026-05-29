---
rule: module-selective-export
category: 模組組織
tags: [module, export, encapsulation, dependency]
---

# Module 只 Export 其他 Module 真正需要的項目

> Module 的 `exports` 陣列通常只放 Service，不暴露 Repository、內部 helper 或 DTO class。

## 原因

- Repository 和內部 helper 是實作細節，暴露後其他 module 可能繞過 Service 直接操作資料。
- 最小化 export 讓模組邊界清晰，改動內部實作不影響外部使用者。

## ❌ Bad

```typescript
import { Module } from '@nestjs/common'
import { UserMapper } from './user.mapper'
import { UsersRepository } from './users.repository'
import { UsersService } from './users.service'

@Module({
  providers: [UsersService, UsersRepository, UserMapper],
  exports: [UsersService, UsersRepository, UserMapper], // 暴露實作細節
})
export class UsersModule {}
```

其他 module 可直接注入 `UsersRepository`，繞過 Service 的業務邏輯與驗證。

## ✅ Good

```typescript
import { Module } from '@nestjs/common'
import { UserMapper } from './user.mapper'
import { UsersRepository } from './users.repository'
import { UsersService } from './users.service'

@Module({
  providers: [UsersService, UsersRepository, UserMapper],
  exports: [UsersService], // 其他 module 只看得到 Service
})
export class UsersModule {}
```

外部 module 只能透過 `UsersService` 存取 user 資料，內部實作可自由修改。
