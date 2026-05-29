---
rule: lifecycle-use-http-server
category: Server 生命週期
tags: [lifecycle, server, port, stability]
---

# 傳入 getHttpServer()

> 傳入 `app.getHttpServer()`，讓 supertest 自行管理 ephemeral port

## 原因

- supertest 接收未啟動的 server 後，自動選擇空閒 port 啟動並在測試結束後關閉
- 傳入已手動 `.listen()` 的 server 讓 port 管理分散，並行測試容易 `EADDRINUSE`
- 手動 listen 的 server 讓 supertest 關閉邏輯與外部衝突，可能造成 connection leak 或 port 未釋放

## ❌ Bad

```typescript
const server = app.getHttpServer().listen(3000);
await request(server).get('/users').expect(200);
```

手動 listen 後傳入，佔用固定 port，測試間可能衝突。

## ✅ Good

```typescript
await request(app.getHttpServer()).get('/users').expect(200);
```

supertest 自行選擇 ephemeral port，測試完成後自動關閉。
