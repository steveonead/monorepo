---
rule: structure-factory-in-beforeall
category: 測試結構
tags: [structure, factory, beforeAll]
---

# app 初始化用 factory + beforeAll

> 將 app 初始化抽成 factory function，於 `beforeAll` 呼叫，不在 `beforeEach`

## 原因

- NestJS 初始化包含 DI 編譯、module bootstrap，成本高，放 `beforeEach` 讓每個測試都重跑
- factory function 可在多個測試檔複用，設定一致

## ❌ Bad

```typescript
describe('UsersController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
  });
});
```

每個測試都跑一次完整初始化，大幅拖慢測試速度。

## ✅ Good

```typescript
// test/helpers/create-app.ts
export async function createTestApp() {
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleRef.createNestApplication();
  await app.init();
  return { app, moduleRef };
}

// users.e2e-spec.ts
describe('UsersController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const { app: testApp } = await createTestApp();
    app = testApp;
  });

  afterAll(async () => {
    await app.close();
  });
});
```

初始化一次，整個 suite 共用，速度快且邏輯集中。
