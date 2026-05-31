---
rule: setup-serialization-exception-filter
category: setup
tags: [setup, filter, exception, zod, logging]
---

# 以 APP_FILTER 全域捕捉 ZodSerializationException 並記錄 log

> 序列化錯誤屬於伺服器端問題，必須記錄 log，不能讓 500 靜默消失。

## 原因

- `ZodSerializationException` 表示回應資料不符合定義的 schema，是後端實作缺陷，需立即被察覺。
- 預設的 NestJS 錯誤處理會回傳 500，但不輸出任何可追蹤的 log 訊息。

## ❌ Bad

```typescript
// app.module.ts — 未處理 ZodSerializationException
import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ZodSerializerInterceptor } from 'nestjs-zod';

@Module({
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: ZodSerializerInterceptor,
    },
  ],
})
export class AppModule {}
```

預設例外處理對 5xx 錯誤仍會輸出 log，但無法捕捉 ZodSerializationException，導致序列化錯誤回傳格式不一致。

## ✅ Good

```typescript
// http-exception.filter.ts
import { ArgumentsHost, Catch, HttpException, Logger } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { ZodSerializationException } from 'nestjs-zod';
import { ZodError } from 'zod';

@Catch(HttpException)
export class HttpExceptionFilter extends BaseExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  // override 為可選關鍵字，官方文件範例不使用 override
  catch(exception: HttpException, host: ArgumentsHost) {
    if (exception instanceof ZodSerializationException) {
      const zodError = exception.getZodError();
      if (zodError instanceof ZodError) {
        this.logger.error('回應序列化失敗', zodError.message);
      }
    }

    super.catch(exception, host);
  }
}
```

```typescript
// app.module.ts
import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { HttpExceptionFilter } from './http-exception.filter';

@Module({
  providers: [
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule {}
```

序列化錯誤觸發時呼叫 `logger.error()`，保留完整錯誤訊息，同時仍將 500 回傳給 client。
