---
rule: assertion-no-spy-in-e2e
category: 斷言分工
tags: [e2e, spy, testing-principles]
---

# e2e 測試不驗實作細節

> 不在 e2e 測試裡用 `vi.spyOn` 驗服務方法呼叫

## 原因

- e2e 測試的職責是驗證 HTTP 行為（status、header、body），不是實作細節
- 服務內部邏輯重構但 HTTP 行為不變時，spy 斷言會無謂地破壞測試

## ❌ Bad

```typescript
it('should create user', async () => {
  const spy = vi.spyOn(userService, 'create');

  await request(app.getHttpServer())
    .post('/users')
    .send({ name: 'Alice' })
    .expect(201);

  expect(spy).toHaveBeenCalledWith({ name: 'Alice' });
});
```

驗服務方法是 unit test 的範疇，在 e2e 層出現是測試污染。

## ✅ Good

```typescript
it('should create user', async () => {
  const res = await request(app.getHttpServer())
    .post('/users')
    .send({ name: 'Alice' })
    .expect(201);

  expect(res.body).toMatchObject({ name: 'Alice' });
});
```

只驗 HTTP 回應，不依賴實作細節。
