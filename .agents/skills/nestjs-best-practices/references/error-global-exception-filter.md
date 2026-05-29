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
@Get(':id')
async findOne(@Param('id') id: string) {
  try {
    return await this.usersService.findOne(id)
  } catch (e) {
    throw new HttpException({ message: e.message, stack: e.stack }, 500)
  }
}
```

stack trace 被序列化後直接回傳給 client，且每個路由各自定義格式，consumer 難以統一解析。

## ✅ Good

```typescript
// global-exception.filter.ts
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: Logger) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()

    const status = exception instanceof HttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR

    const message = exception instanceof HttpException
      ? exception.message
      : 'Internal server error'

    this.logger.error(exception)

    response.status(status).json({ statusCode: status, message })
  }
}

// app.module.ts
// providers: [{ provide: APP_FILTER, useClass: GlobalExceptionFilter }]
```

所有錯誤集中處理，回應格式一致，stack trace 只進 logger 不進 response body。
