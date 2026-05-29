---
rule: structure-cleanup-timing
category: 測試結構
tags: [structure, cleanup, beforeEach, database]
---

# 資料清理放在 beforeEach

> 資料清理放在 `beforeEach`，不在 `afterAll`，保證每個測試起始狀態一致

## 原因

- `afterAll` 只在整個 suite 結束後執行一次，測試失敗中止後後續測試被上一筆資料污染
- `beforeEach` 在每個測試前清理，無論前一個測試是否成功，初始狀態都一致

## ❌ Bad

```typescript
describe('UsersController (e2e)', () => {
  afterAll(async () => {
    await db.users.deleteMany();
  });
});
```

測試失敗中止後，剩餘測試會讀到上一個測試留下的資料。

## ✅ Good

```typescript
describe('UsersController (e2e)', () => {
  beforeEach(async () => {
    await db.users.deleteMany();
  });
});
```

每個測試前清理，確保乾淨的初始狀態。
