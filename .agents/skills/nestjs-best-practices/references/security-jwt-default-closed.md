---
rule: security-jwt-default-closed
category: security
tags: [security, jwt, guard, auth, decorator]
---

# JWT Guard 全局封閉，以 `@Public()` 明確開放例外路由

> 預設封閉所有路由，僅以 `@Public()` 白名單開放公開端點，避免因忘記掛 Guard 而意外暴露。

## 原因

- 新增路由時若忘記加 `@UseGuards`，路由會在無聲無息中成為公開端點
- 全局封閉反轉預設值，安全邊界由框架層強制保障，不依賴開發者記憶
- `@Public()` 作為明確意圖的標記，讓 code review 能直接識別哪些路由是公開的

## ❌ Bad

```typescript
// 需在每個受保護的 endpoint 手動加 Guard
@UseGuards(JwtAuthGuard)
@Get('profile')
getProfile(@Request() req: Request) {
  return req.user
}

// 忘記加 @UseGuards 的路由會意外成為公開端點
@Get('sensitive-data')
getSensitiveData() {
  return this.dataService.findAll()
}
```

忘記掛 `@UseGuards` 的路由直接暴露，且問題不會在測試期間立刻顯現。

## ✅ Good

```typescript
// public.decorator.ts
import { SetMetadata } from '@nestjs/common'

export const IS_PUBLIC_KEY = 'isPublic'
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true)

// jwt.guard.ts
import { ExecutionContext, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { AuthGuard } from '@nestjs/passport'
import { IS_PUBLIC_KEY } from './public.decorator'

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super()
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ])
    if (isPublic) return true
    return super.canActivate(context)
  }
}

// app.module.ts
import { APP_GUARD } from '@nestjs/core'
import { JwtAuthGuard } from './auth/jwt.guard'

// providers 陣列中加入：
// { provide: APP_GUARD, useClass: JwtAuthGuard }

// auth.controller.ts
import { Public } from './public.decorator'

@Public()
@Post('login')
login(@Body() dto: LoginDto) {
  return this.authService.login(dto)
}

@Public()
@Get('health')
healthCheck() {
  return { status: 'ok' }
}
```

全局 Guard 讓每條路由預設受保護，`@Public()` 明確標記例外，新增路由時安全是預設行為。

## 例外

Auth callback（OAuth redirect）、health check、webhook 接收端點須標記 `@Public()`。
