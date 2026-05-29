---
rule: advanced-type-guard
category: 進階型別技巧
tags: [advanced, type-guard, narrowing]
---

# 自訂 type guard 封裝重複收窄

> 重複出現的型別收窄邏輯用自訂 type guard（`function isX(v): v is X`）封裝，呼叫端用一個函式完成收窄。

## 原因

- 重複的 `typeof`/`instanceof`/`in` 檢查散落各處，容易遺漏或不一致
- Type guard 封裝後修改收窄邏輯只需改一處
- 函式名稱（`isUser`、`isApiError`）直接說明收窄意圖

## ❌ Bad

```ts
function processA(value: unknown) {
  if (typeof value === "object" && value !== null && "id" in value && "name" in value) {
    // 主邏輯
  }
}

function processB(value: unknown) {
  if (typeof value === "object" && value !== null && "id" in value && "name" in value) {
    // 同樣的收窄邏輯重複
  }
}
```

同樣的收窄條件寫了兩次，若 `User` 型別新增欄位，需要找出所有散落的檢查點逐一更新，容易遺漏。

## ✅ Good

```ts
type User = { id: string; name: string };

function isUser(value: unknown): value is User {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    "name" in value
  );
}

function processA(value: unknown) {
  if (!isUser(value)) return;
  console.log(value.name); // TS 推斷為 User
}

function processB(value: unknown) {
  if (!isUser(value)) return;
  console.log(value.id);
}
```

收窄邏輯集中在 `isUser`，`User` 型別變動時只需修改一處。呼叫端只需一行 `if (!isUser(value)) return` 即完成驗證與型別收窄。
