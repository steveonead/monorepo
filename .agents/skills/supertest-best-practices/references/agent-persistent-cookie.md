---
rule: agent-persistent-cookie
category: Agent
tags: [agent, cookie, session]
---

# 用 request.agent() 維持 session

> 跨請求維持 session 用 `request.agent()`，不手動帶 cookie header

## 原因

- `request.agent()` 持有 cookie jar，自動攜帶 server Set-Cookie 設的 cookie
- 手動帶 header 需要自行解析 Set-Cookie，格式容易出錯

## ❌ Bad

```typescript
const loginRes = await request(app.getHttpServer())
  .post('/auth/login')
  .send({ email: 'a@b.com', password: 'pw' });

const cookie = loginRes.headers['set-cookie'][0];

await request(app.getHttpServer())
  .get('/profile')
  .set('Cookie', cookie)
  .expect(200);
```

手動解析 `set-cookie` 並帶入下一個請求，容易出錯。

## ✅ Good

```typescript
const agent = request.agent(app.getHttpServer());

await agent
  .post('/auth/login')
  .send({ email: 'a@b.com', password: 'pw' })
  .expect(200);

await agent.get('/profile').expect(200);
```

agent 自動帶 cookie，不需手動處理。
