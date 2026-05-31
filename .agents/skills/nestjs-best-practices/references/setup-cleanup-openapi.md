---
rule: setup-cleanup-openapi
category: setup
tags: [setup, openapi, swagger, zod, nullable]
---

# 掛載 Swagger 前呼叫 cleanupOpenApiDoc() 修正 nullable 格式

> Zod v4 依 OpenAPI 3.1 規格輸出 nullable，多數工具鏈仍以 OpenAPI 3.0 為主，掛載前須後處理轉換格式。

## 原因

- Zod v4 依 OpenAPI 3.1 規格輸出 `anyOf: [{ type: 'X' }, { type: 'null' }]`，此為有效的 OpenAPI 3.1 語法。
- 多數 Swagger UI / 工具鏈仍以 OpenAPI 3.0 為主，`cleanupOpenApiDoc` 負責將此 3.1 語法轉換為 OpenAPI 3.0 相容的 `nullable: true`。
- 未轉換的文件會導致 Swagger UI 顯示異常，以及前端自動產生的 client type 出錯。

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
  // 直接掛載，anyOf 的 3.1 語法未轉換為 3.0 相容格式
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
}

bootstrap();
```

`anyOf: [{ type: 'string' }, { type: 'null' }]` 是有效的 OpenAPI 3.1 語法，但 OpenAPI 3.0 客戶端工具無法正確解讀。

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
