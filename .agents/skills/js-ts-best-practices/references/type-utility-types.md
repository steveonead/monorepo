---
rule: type-utility-types
category: 型別設計
tags: [types, utility-types, omit, pick]
---

# 善用內建 utility types

> 從既有 type 衍生新型別時，用 `Omit`、`Pick`、`Partial`、`Record`、`ReturnType`、`keyof` 等內建 utility types，禁止手刻重複定義。

## 原因

- 手刻衍生型別在原型別修改時需要同步更新，容易漏改
- Utility types 建立衍生關係，原型別改動時衍生型別自動更新

## ❌ Bad

```ts
type User = { id: string; name: string; email: string; role: string };

// 手刻衍生型別，與 User 無關聯
type UserPreview = { id: string; name: string };
type UserUpdate = { name?: string; email?: string; role?: string };
```

`User` 新增欄位時，`UserPreview` 與 `UserUpdate` 不會自動更新，需要人工同步，容易漏改。

## ✅ Good

```ts
type User = { id: string; name: string; email: string; role: string };

type UserPreview = Pick<User, "id" | "name">;
type UserUpdate = Partial<Omit<User, "id">>;

// ReturnType 從函式推導回傳型別
type ApiResponse = ReturnType<typeof fetchUser>;
```

衍生型別與 `User` 建立關聯，`User` 修改時衍生型別自動跟著更新，無需人工同步。
