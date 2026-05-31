---
rule: error-global-exception-filter
category: error-handling
tags: [error-handling, exception-filter, global, http-response]
---

# 以 Global Exception Filter 統一錯誤回應格式

> 所有錯誤都經同一個 filter 處理，生產環境不暴露 stack trace。

## 原因

- 沒有統一 filter 時，NestJS 預設格式（`{ statusCode, message, error }`）與自訂格式並存，API consumer 無法依賴一致的錯誤結構。
- 各路由自行 catch 錯誤容易忘記過濾敏感資訊，造成 stack trace 外洩。

## ❌ Bad

```typescript
import { Get, HttpException, HttpStatus, Param } from '@nestjs/common'

@Get(':id')
async findOne(@Param('id') id: string) {
  try {
    return await this.usersService.findOne(id)
  } catch (error) {
    throw new HttpException(
      { message: (error as Error).message, stack: (error as Error).stack },
      HttpStatus.INTERNAL_SERVER_ERROR,
    )
  }
}
```

stack trace 被序列化後直接回傳給 client，且每個路由各自定義格式，consumer 難以統一解析。

## ✅ Good

```typescript
// global-exception.filter.ts
import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common'
import { HttpAdapterHost } from '@nestjs/core'

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name)

  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const { httpAdapter } = this.httpAdapterHost

    const ctx = host.switchToHttp()

    const status = exception instanceof HttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR

    const message = exception instanceof HttpException
      ? exception.getResponse()
      : 'Internal server error'

    this.logger.error(exception)

    httpAdapter.reply(ctx.getResponse(), { statusCode: status, message }, status)
  }
}

// app.module.ts
// providers: [{ provide: APP_FILTER, useClass: GlobalExceptionFilter }]
```

所有錯誤集中處理，回應格式一致，stack trace 只進 logger 不進 response body。

> **`exception.getResponse()` vs `exception.message`**：`exception.message` 只回傳預設字串（如 `'Bad Request'`），當呼叫端拋出帶有自訂 payload 的例外時（如 `throw new BadRequestException({ code: 'ERR_001' })`），`exception.message` 不包含完整 response body；應改用 `exception.getResponse()` 以取得完整的回應物件。

> **`HttpAdapterHost` 與平台無關性**：`@Catch()` 的 catch-all filter 應使用 `HttpAdapterHost` 注入 `httpAdapter`，再透過 `httpAdapter.reply()` 回應，而非直接操作 Express 的 `Response` 物件。這樣可確保 filter 在 Express 與 Fastify 兩種平台下都能正常運作，避免平台鎖定。
