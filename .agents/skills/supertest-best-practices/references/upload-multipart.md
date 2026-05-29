---
rule: upload-multipart
category: File Upload
tags: [upload, multipart, form-data]
---

# multipart 上傳用 .field() + .attach()

> `.field()` 傳文字欄位，`.attach()` 傳檔案，不混用 `.send()`，不手動設 `Content-Type`

## 原因

- `.send()` 與 `.attach()` 同時使用時，後呼叫的會覆蓋前者
- 手動設 `Content-Type: multipart/form-data` 不含 boundary，server 無法解析 request body
- supertest 在使用 `.attach()` 時自動生成正確的 Content-Type 與 boundary

## ❌ Bad

```typescript
await request(app.getHttpServer())
  .post('/upload')
  .send({ description: 'avatar' }) // 被 .attach() 覆蓋
  .attach('file', Buffer.from('...'), 'avatar.png')
  .set('Content-Type', 'multipart/form-data') // 無 boundary，server 解析失敗
  .expect(201);
```

混用 `.send()` 且手動設 Content-Type，上傳必然失敗。

## ✅ Good

```typescript
await request(app.getHttpServer())
  .post('/upload')
  .set('Authorization', `Bearer ${token}`)
  .field('description', 'avatar image')
  .attach('file', Buffer.from('...'), 'avatar.png')
  .expect(201);
```

`.field()` 和 `.attach()` 組合，supertest 自動設定帶 boundary 的 Content-Type。
