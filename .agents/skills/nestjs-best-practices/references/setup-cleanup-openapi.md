---
rule: setup-cleanup-openapi
category: setup
tags: [setup, openapi, swagger, zod, nullable]
---

# 掛載 Swagger 前呼叫 cleanupOpenApiDoc() 修正 nullable 格式

> Zod v4 的 nullable 輸出不符合 OpenAPI 3.0 規格，必須後處理再掛載文件。

## 原因

- Zod v4 將 nullable 輸出為 `anyOf: [{ type: 'string' }, { type: 'null' }]`，OpenAPI 3.0 不支援此格式。
- 未修正的文件會導致 Swagger UI 顯示異常，以及前端自動產生的 client type 出錯。

## ❌ Bad

```typescript
// main.ts
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('API')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  // 直接掛載，nullable 格式不符合 OpenAPI 3.0
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
}

bootstrap();
```

`anyOf: [{ type: 'string' }, { type: 'null' }]` 在 OpenAPI 3.0 客戶端工具中解析錯誤或被忽略。

## ✅ Good

```typescript
// main.ts
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { cleanupOpenApiDoc } from 'nestjs-zod';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('API')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  const cleaned = cleanupOpenApiDoc(document);
  SwaggerModule.setup('api', app, cleaned);

  await app.listen(3000);
}

bootstrap();
```

`cleanupOpenApiDoc()` 將 `anyOf` 格式轉換為 `nullable: true`，符合 OpenAPI 3.0 規格，Swagger UI 與程式碼產生器正確解讀。
