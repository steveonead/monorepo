---
rule: async-await-chain
category: Async 風格
tags: [async, promise, floating-promise]
---

# 必須 await 或 return supertest chain

> 沒有 `await` 或 `return`，斷言失敗的 Promise 被丟棄，測試永遠通過

## 原因

- supertest chain 是 Promise，沒有 `await` 或 `return` 時成為 floating promise
- Vitest 不等待 floating promise，斷言失敗只讓 Promise reject，不影響測試結果

## ❌ Bad

```typescript
it('should return 200', () => {
  request(app.getHttpServer()).get('/').expect(200); // floating promise
});
```

測試永遠通過，無論 server 是否回傳 200。

## ✅ Good

```typescript
it('should return 200', async () => {
  await request(app.getHttpServer()).get('/').expect(200);
});
```

`await` 確保斷言失敗時測試正確失敗。
