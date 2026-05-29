---
rule: structure-replicate-global-setup
category: 測試結構
tags: [structure, global-pipes, bootstrap]
---

# 測試 factory 手動複製 global 設定

> `main.ts` 的 global pipes/filters/interceptors 不會自動套用在測試環境

## 原因

- 測試環境與 `main.ts` bootstrap 完全獨立，`useGlobalPipes()` 等設定不會繼承
- 未複製 global 設定，DTO 驗證、exception filter 等行為與 production 不同

## ❌ Bad

```typescript
export async function createTestApp() {
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleRef.createNestApplication();
  await app.init();
  return { app, moduleRef };
}
```

沒有 `useGlobalPipes()`，DTO 的 class-validator 驗證在測試中不生效。

## ✅ Good

```typescript
export async function createTestApp() {
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleRef.createNestApplication();
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalFilters(new HttpExceptionFilter());
  await app.init();
  return { app, moduleRef };
}
```

複製 `main.ts` 中所有的 global 設定，確保測試行為與 production 一致。
