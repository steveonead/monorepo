---
rule: safety-no-type-assertion
category: 型別安全
tags: [safety, type-assertion, type-guard]
---

# 限制 `as` 斷言，優先 type guard

> 預設禁止 `as` 型別斷言，先用 `typeof`、`instanceof`、`in` 或自訂 type guard 做型別收窄。

## 原因

- `as` 強制告訴 TypeScript 型別是 X，但不實際驗證，runtime 出錯時沒有任何保護
- Type guard 在 runtime 真正驗證型別，收窄後的型別是有保障的
- `typeof`、`instanceof`、`in` 是 TypeScript 的原生 narrowing 機制，不增加任何 runtime 成本

## ❌ Bad

```ts
function processResponse(data: unknown) {
  const user = data as User; // 沒有驗證，runtime 可能 crash
  return user.name.toUpperCase();
}
```

`as` 告訴編譯器「相信我」，但若 `data` 實際上不是 `User`，`user.name` 會是 `undefined`，造成 runtime crash 卻沒有任何編譯期警告。

## ✅ Good

```ts
function isUser(value: unknown): value is User {
  return (
    typeof value === "object" &&
    value !== null &&
    "name" in value &&
    typeof (value as User).name === "string"
  );
}

function processResponse(data: unknown) {
  if (!isUser(data)) throw new Error("Invalid user data");
  return data.name.toUpperCase(); // TS 推斷為 User
}
```

Type guard 在 runtime 真正驗證結構，通過後 TypeScript 自動收窄型別，不需要 `as`。

## 例外

以下情境允許 `as`：
- 測試 fixture 的靜態資料（`const mockUser = { ... } as User`）
- DOM 查詢確定存在的元素（`document.getElementById("app") as HTMLDivElement`）
- `as unknown as T` 雙重斷言（最後手段，須加說明）
- 第三方套件型別定義不足、無法繞過時
