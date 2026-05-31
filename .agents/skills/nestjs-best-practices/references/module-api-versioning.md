---
rule: module-api-versioning
category: module-architecture
tags: [api-versioning, uri-versioning, versioning]
---

# 以 enableVersioning + @Controller({ version }) + @Version() 三層機制統一管理 API 版本

> 啟用 URI 版本後，用 `@Controller({ version })` 指定 Controller 層級版本，用 `@Version()` 覆寫單一路由，不手動在路徑寫 `/v1/`。

## 原因

- 在路徑中手動加 `/v1/`、`/v2/` prefix 沒有型別保護，版本號容易拼錯或遺漏，且難以全局切換。
- NestJS 內建 Versioning 機制提供三層控制（全局預設、Controller 層級、單一路由覆寫），版本邏輯集中在框架層，不散落在字串路徑中。
- 未來調升預設版本只需修改 `defaultVersion`，無需逐一更新路徑字串。

## ❌ Bad

```typescript
// app.module.ts — 無全局版本設定

@Controller('v1/users')
export class UsersV1Controller {
  @Get()
  findAll() { /* ... */ }
}

@Controller('v2/users')
export class UsersV2Controller {
  @Get()
  findAll() { /* ... */ }
}
```

版本號硬編在路徑字串中，各 Controller 各自為政，沒有統一管理機制，升版時需手動搜尋替換。

## ✅ Good

```typescript
// main.ts
import { VersioningType } from '@nestjs/common'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  })
  await app.listen(3000)
}

// users-v1.controller.ts
@Controller({ path: 'users', version: '1' })
export class UsersV1Controller {
  @Get()
  findAll() { /* ... */ }

  // 此路由覆寫為 v2，其餘路由仍是 v1
  @Version('2')
  @Get('featured')
  findFeatured() { /* ... */ }
}

// users-v2.controller.ts
@Controller({ path: 'users', version: '2' })
export class UsersV2Controller {
  @Get()
  findAll() { /* ... */ }
}
```

版本由框架統一管理：`enableVersioning` 設定全局預設，`@Controller({ version })` 控制 Controller 層級，`@Version()` 精細覆寫單一路由。

## 例外

- 若專案同時需要 Header Versioning 或 Media Type Versioning，可傳入 `type: VersioningType.HEADER` 或 `MEDIA_TYPE`，Controller 裝飾器用法相同。
- 對外公開的 SDK 或 Client 若已依賴固定路徑，需在遷移期間保留舊路徑並搭配 redirect，不應直接移除。
