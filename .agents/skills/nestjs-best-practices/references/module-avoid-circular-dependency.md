---
rule: module-avoid-circular-dependency
category: 模組組織
tags: [module, circular-dependency, EventEmitter, forwardRef]
---

# 循環依賴優先以 EventEmitter 解耦，`forwardRef()` 是最後手段

> A 依賴 B、B 依賴 A 是設計問題，優先提取第三模組或以事件解耦，不用 `forwardRef()` 掩蓋。

## 原因

- `forwardRef()` 掩蓋架構問題，循環依賴在執行期才爆發，debug 困難。
- EventEmitter 解耦讓兩個 module 都只依賴事件合約，不互相依賴。

## ❌ Bad

```typescript
// auth.module.ts
import { forwardRef, Module } from '@nestjs/common'
import { UsersModule } from '../users/users.module'
import { AuthService } from './auth.service'

@Module({
  imports: [forwardRef(() => UsersModule)],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}

// users.module.ts
import { forwardRef, Module } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module'
import { UsersService } from './users.service'

@Module({
  imports: [forwardRef(() => AuthModule)],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
```

`forwardRef()` 讓循環依賴得以存在，但問題根源未解決，執行期若初始化順序有誤則會靜默失敗。

## ✅ Good

```typescript
// events.ts — 共用事件合約，事件名不寫死在兩端
export const USER_REGISTERED = 'user.registered'

export type UserRegisteredPayload = {
  userId: string
}

// app.module.ts — 根模組註冊，否則 EventEmitter2 無法注入
// imports: [EventEmitterModule.forRoot()]

// auth.service.ts — 發事件，不直接依賴 UsersService
import { Injectable } from '@nestjs/common'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { RegisterDto } from './dto/register.dto'
import { USER_REGISTERED } from './events'

@Injectable()
export class AuthService {
  constructor(private readonly eventEmitter: EventEmitter2) {}

  async register(dto: RegisterDto) {
    const user = await this.createUser(dto)
    this.eventEmitter.emit(USER_REGISTERED, { userId: user.id })
  }

  private async createUser(dto: RegisterDto) {
    // 建立帳號邏輯
    return { id: 'new-user-id' }
  }
}

// users.service.ts — 訂閱事件，不依賴 AuthService
import { Injectable } from '@nestjs/common'
import { OnEvent } from '@nestjs/event-emitter'
import { USER_REGISTERED, type UserRegisteredPayload } from './events'

@Injectable()
export class UsersService {
  @OnEvent(USER_REGISTERED)
  async handleUserRegistered(payload: UserRegisteredPayload) {
    // 處理 user profile 初始化邏輯
  }
}
```

兩個 Service 都只依賴事件合約，互相完全解耦，可獨立測試。

## 例外

確認無法避免循環依賴時（例如 lazy-loaded module 的限制），才使用 `forwardRef()`，並在程式碼旁加上說明原因的 comment。
