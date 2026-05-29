---
rule: assertion-http-vs-payload
category: 斷言分工
tags: [assertion, http, payload]
---

# 分工斷言 HTTP 合約與 payload 結構

> HTTP 合約（status、header）用 supertest `.expect()`，payload 結構用 vitest `expect()`

## 原因

- supertest 的 `.expect()` 在 status 或 header 不符時提供清晰 diff
- payload 結構驗證用 vitest 的 `objectContaining`、`arrayContaining` 更靈活

## ❌ Bad

```typescript
const res = await request(app.getHttpServer()).get('/users');
expect(res.status).toBe(200);
expect(res.headers['content-type']).toMatch(/json/);
```

用 vitest 驗 status 和 header，錯誤訊息不如 supertest 清晰。

## ✅ Good

```typescript
const res = await request(app.getHttpServer())
  .get('/users')
  .expect(200)
  .expect('Content-Type', /json/);

expect(res.body).toEqual(
  expect.arrayContaining([
    expect.objectContaining({ id: expect.any(String) }),
  ]),
);
```

supertest 負責 HTTP 合約，vitest 負責 body 結構。
