---
rule: request-send-json
category: 請求建構
tags: [request, json, content-type]
---

# JSON body 用 .send(object)

> 傳入 plain object 時 supertest 自動設 `Content-Type: application/json`

## 原因

- supertest 偵測到 `.send()` 的參數是 object 時，自動序列化並設 Content-Type
- 手動設定是多餘的，且容易設錯（如誤加 charset、格式錯誤）

## ❌ Bad

```typescript
await request(app.getHttpServer())
  .post('/users')
  .set('Content-Type', 'application/json')
  .send(JSON.stringify({ name: 'Alice' }))
  .expect(201);
```

手動序列化並設 Content-Type，多餘且容易出錯。

## ✅ Good

```typescript
await request(app.getHttpServer())
  .post('/users')
  .send({ name: 'Alice' })
  .expect(201);
```

直接傳 object，supertest 自動處理序列化與 Content-Type。
