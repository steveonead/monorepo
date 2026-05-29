---
rule: async-avoid-end-callback
category: Async 風格
tags: [async, callback, error-handling]
---

# 不混用 .end(callback) 與 async/await

> `.end()` 讓 chain 脫離 Promise 體系，callback 內的錯誤無法被外層 async 函式捕捉

## 原因

- `.end()` 呼叫後 chain 不再是 thenable，`await` 等待的對象不存在
- callback 內的 `expect()` 失敗會拋出，但在 callback context 中無法被外層 async 函式捕捉，測試照常通過

## ❌ Bad

```typescript
it('should return users', async () => {
  await request(app.getHttpServer())
    .get('/users')
    .end((err, res) => {
      expect(res.status).toBe(200); // 斷言失敗不會讓測試失敗
    });
});
```

`expect()` 失敗拋出的錯誤在 callback 裡，外層 async 函式捕捉不到。

## ✅ Good

```typescript
it('should return users', async () => {
  const res = await request(app.getHttpServer())
    .get('/users')
    .expect(200);
});
```

使用 Promise chain，斷言失敗直接 reject，測試正確失敗。
