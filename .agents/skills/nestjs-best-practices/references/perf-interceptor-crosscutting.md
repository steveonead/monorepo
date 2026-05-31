---
rule: perf-interceptor-crosscutting
category: performance
tags: [performance, interceptor, logging, cross-cutting, controller]
---

# Logging、response transform、caching 等 cross-cutting concerns 放 Interceptor

> 橫切關注點集中在 Interceptor，Controller 與 Service 保持薄層，不摻雜基礎設施邏輯。

## 原因

- Interceptor 包覆 Handler 執行，能同時修改進來的請求與出去的回應，是唯一適合放這類邏輯的層
- logging 混入 Controller 會讓每個 handler 重複相同的樣板，且難以統一修改格式
- 執行順序為：Middleware → Guards → Interceptors（before）→ Pipes → Handler → Interceptors（after）→ Exception Filters

## ❌ Bad

```typescript
// users.controller.ts
import { Controller, Get, Logger } from '@nestjs/common'

@Controller('users')
export class UsersController {
  private readonly logger = new Logger(UsersController.name)

  constructor(private readonly usersService: UsersService) {}

  @Get()
  async findAll() {
    this.logger.log('findAll called')
    const start = Date.now()
    const result = await this.usersService.findAll()
    this.logger.log(`findAll took ${Date.now() - start}ms`)
    return result
  }
}
```

Logging 邏輯散落在每個 Controller 中，格式難以統一，修改時需逐一更動。

## ✅ Good

```typescript
// logging.interceptor.ts
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common'
import { Request } from 'express'
import { Observable } from 'rxjs'
import { tap } from 'rxjs/operators'

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name)

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest<Request>()
    const start = Date.now()
    this.logger.log(`${req.method} ${req.url}`)

    return next
      .handle()
      .pipe(tap(() => this.logger.log(`completed in ${Date.now() - start}ms`)))
  }
}

// app.module.ts
import { APP_INTERCEPTOR } from '@nestjs/core'
import { LoggingInterceptor } from './logging.interceptor'

// providers 陣列中加入：
// { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor }

// users.controller.ts — Controller 保持薄層，不含任何 logging 邏輯
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll() {
    return this.usersService.findAll()
  }
}
```

Logging 邏輯集中在 Interceptor，Controller 只負責路由與呼叫 Service，格式修改只需改一個地方。
