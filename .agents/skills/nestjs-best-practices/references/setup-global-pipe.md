---
rule: setup-global-pipe
category: setup
tags: [setup, pipe, validation, zod, dependency-injection]
---

# 以 APP_PIPE token 全域註冊 ZodValidationPipe

> 用 `APP_PIPE` 讓 DI 容器管理 pipe，而非在 `main.ts` 手動建立實例。

## 原因

- `app.useGlobalPipes()` 在 NestJS DI 容器外部建立實例，pipe 無法注入任何服務。
- `APP_PIPE` 由 DI 容器管理，支援 request/transient scope 與依賴注入。

## ❌ Bad

```typescript
// main.ts
import { NestFactory } from '@nestjs/core';
import { ZodValidationPipe } from 'nestjs-zod';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ZodValidationPipe()); // 容器外建立，無法注入服務
  await app.listen(3000);
}

bootstrap();
```

在容器外建立 pipe 實例，未來若 pipe 需要注入設定服務或 logger，此寫法無法支援。

## ✅ Good

```typescript
// app.module.ts
import { Module } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';
import { ZodValidationPipe } from 'nestjs-zod';

@Module({
  providers: [
    {
      provide: APP_PIPE,
      useClass: ZodValidationPipe,
    },
  ],
})
export class AppModule {}
```

DI 容器統一管理 pipe 生命週期，pipe 可注入其他服務，行為與 controller-level pipe 一致。
