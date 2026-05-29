---
rule: advanced-assertion-function
category: 進階型別技巧
tags: [advanced, assertion, type-guard]
---

# 用 assertion function 取代手寫 throw + 轉型

> 「驗證失敗就拋例外」的場景用 assertion function（`function assertX(v): asserts v is X`），TS 在後續自動收窄型別。

## 原因

- 手寫 `if (!isX(v)) throw new Error(...)` 之後仍需要 `as X` 轉型，語意重複
- Assertion function 告訴 TypeScript：函式回傳後，參數的型別一定是 X
- 適合在函式進入點做前置條件驗證，驗證通過後整個函式體型別已收窄

## ❌ Bad

```ts
function processUser(value: unknown) {
  if (typeof value !== "object" || value === null || !("id" in value)) {
    throw new Error("Not a user");
  }
  const user = value as User; // 驗證完還要手動 cast
  return user.name;
}
```

驗證邏輯和 `as User` cast 分離，閱讀者必須同時理解兩段程式碼才能確認型別安全。

## ✅ Good

```ts
function assertUser(value: unknown): asserts value is User {
  if (
    typeof value !== "object" ||
    value === null ||
    !("id" in value) ||
    !("name" in value)
  ) {
    throw new Error("Not a valid User");
  }
}

function processUser(value: unknown) {
  assertUser(value); // 之後 value 自動收窄為 User
  return value.name; // 不需要 as，型別安全
}
```

`assertUser` 的回傳型別 `asserts value is User` 告訴 TypeScript：若函式正常回傳，`value` 就是 `User`。呼叫端不需要 `as`，型別收窄自動完成。
