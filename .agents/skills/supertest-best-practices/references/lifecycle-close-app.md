---
rule: lifecycle-close-app
category: Server 生命週期
tags: [lifecycle, cleanup, afterAll]
---

# afterAll 關閉 app

> 在 `afterAll` 呼叫 `await app.close()`

## 原因

- NestJS app 持有 HTTP server、DB 連線等資源，未關閉讓 Vitest 偵測到 open handles 並顯示警告
- 後續測試可能因相同 port 未釋放而啟動失敗

## ❌ Bad

```typescript
describe('UsersController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const { app: testApp } = await createTestApp();
    app = testApp;
  });

  // 沒有 afterAll cleanup
});
```

缺少 `app.close()`，測試結束後 server 仍在背景執行。

## ✅ Good

```typescript
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

`app.close()` 觸發 lifecycle hooks 並釋放所有資源。
