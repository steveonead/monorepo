---
rule: type-precise-types
category: 型別設計
tags: [types, literal-union, branded-type]
---

# 用精確型別取代寬鬆型別

> 用 literal union、template literal、tuple、branded type 取代 `string`、`number`、`any[]`，型別愈精確，編譯期能擋下的錯誤愈多。

## 原因

- 寬鬆型別讓錯誤的值在 runtime 才被發現
- Literal union 讓 `switch`/`if` 分支由型別系統保護
- Branded type 讓語意相同但用途不同的 string 無法互換（如 `UserId` vs `OrderId`）

## ❌ Bad

```ts
function setStatus(status: string) { /* ... */ }
setStatus("actve"); // 拼錯了，但編譯通過

function getRange(start: number, end: number) { /* ... */ }
getRange(100, 0); // 順序錯了，沒有保護
```

寬鬆型別讓拼錯、順序錯等低級錯誤在編譯期完全隱形，直到 runtime 才爆出。

## ✅ Good

```ts
type Status = "active" | "inactive" | "pending";
function setStatus(status: Status) { /* ... */ }
// setStatus("actve"); // TS 報錯

declare const __brand: unique symbol;
type Brand<T, B> = T & { readonly [__brand]: B };
type UserId = Brand<string, "UserId">;
type OrderId = Brand<string, "OrderId">;

function getUser(id: UserId) { /* ... */ }
// getUser(orderId); // TS 報錯，UserId ≠ OrderId
```

Literal union 讓 typo 直接在編譯期被攔截，branded type 讓不同語意的 string 無法意外互換。
