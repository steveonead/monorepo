---
rule: assertion-simple-expect
category: 斷言分工
tags: [assertion, deep-equal, dynamic-fields]
---

# .expect(status, body) 只用於精確比對

> `.expect(200, { key: 'value' })` 做完整 deep equal，response 有動態欄位時分開寫

## 原因

- `.expect(status, body)` 是完整 deep equal，id、createdAt 等動態欄位會讓比對失敗

## ❌ Bad

```typescript
await request(app.getHttpServer())
  .post('/users')
  .send({ name: 'Alice' })
  .expect(201, { id: '123', name: 'Alice', createdAt: '2024-01-01' });
```

動態欄位（`id`、`createdAt`）無法預先知道確切值，比對必然失敗。

## ✅ Good

```typescript
const res = await request(app.getHttpServer())
  .post('/users')
  .send({ name: 'Alice' })
  .expect(201);

expect(res.body).toMatchObject({ name: 'Alice' });
expect(res.body.id).toBeDefined();
```

分開寫，動態欄位用 `toBeDefined()` 或 `expect.any()` 驗。
