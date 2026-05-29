---
rule: parse-safe-parse-default
category: 解析邊界
tags: [解析邊界, safeParse, parse, error-handling]
---

# 外部輸入優先使用 safeParse()

> 處理外部輸入用 `safeParse()`；只在「失敗即是 bug」的斷言場景用 `parse()`。

## 原因

- `safeParse()` 回傳結構化結果 `{ success, data, error }`，不 throw，呼叫端可完整控制錯誤流程。
- `parse()` 失敗時拋出 `ZodError`，若呼叫端沒有 try/catch，錯誤會靜默穿透至上層，難以追蹤。
- 外部輸入（API body、query string、env var）天然不可信，應顯式處理驗證失敗路徑。

## ❌ Bad

```typescript
// API route handler — 外部輸入直接 parse()
export const createUser = async (req: Request, res: Response) => {
  const body = UserSchema.parse(req.body); // ZodError 會穿透為 500
  await db.user.create({ data: body });
  res.json({ ok: true });
};
```

若 `req.body` 不合法，`ZodError` 會被框架捕捉為 500 Internal Server Error，而非 400 Bad Request。

## ✅ Good

```typescript
// API route handler — 外部輸入用 safeParse()
export const createUser = async (req: Request, res: Response) => {
  const result = UserSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ errors: result.error.issues });
    return;
  }
  await db.user.create({ data: result.data });
  res.json({ ok: true });
};
```

驗證失敗被顯式處理為 400，`result.data` 在 success branch 內已是完整型別。

## 例外

在測試或內部斷言中，輸入來自已知 fixture，失敗代表測試設定有誤，此時可用 `parse()` 讓錯誤直接爆出：

```typescript
// 測試 fixture 初始化 — 失敗即是 bug，parse() 合適
const fixture = UserSchema.parse({ name: 'Alice', age: 30 });
```
