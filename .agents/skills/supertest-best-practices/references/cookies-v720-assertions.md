---
rule: cookies-v720-assertions
category: Cookie Assertions
tags: [cookies, assertions, v7.2.0]
---

# 用 request.cookies API 斷言 cookie

> v7.2.0+ 用 `request.cookies` API 斷言 cookie，不手動解析 `set-cookie` header

## 原因

- 手動解析 `set-cookie` header 需處理多個 cookie、attributes 格式，容易出錯
- `request.cookies` 提供鏈式 API，支援 `.set()`、`.new()`、`.contain()`、`.not()` 等斷言

## ❌ Bad

```typescript
const res = await request(app.getHttpServer())
  .get('/auth/login')
  .expect(200);

const setCookieHeader = res.headers['set-cookie'] as string[];
const sessionCookie = setCookieHeader.find((c) => c.startsWith('session='));
expect(sessionCookie).toBeDefined();
expect(sessionCookie).toContain('HttpOnly');
```

手動解析 `set-cookie` header，冗長且格式敏感。

## ✅ Good

```typescript
import request from 'supertest';

const cookies = request.cookies;

await request(app.getHttpServer())
  .get('/auth/login')
  .expect(200)
  .expect(cookies.set({ name: 'session', options: ['httponly', 'secure'] }))
  .expect(cookies.not('set', { name: 'debug_token' }));
```

鏈式 API 清晰，直接對 cookie 做結構化斷言。

## 例外

需 supertest >= 7.2.0 且 `@types/supertest >= ^7.2`，舊版型別定義沒有 `cookies` 屬性。
