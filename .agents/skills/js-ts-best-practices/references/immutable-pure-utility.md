---
rule: immutable-pure-utility
category: 不可變與純粹
tags: [immutability, pure-function, utility]
---

# Utility function 必須純函式

> Utility function 一律寫成純函式：相同輸入產生相同輸出，不依賴外部狀態、不產生副作用。

## 原因

- 純函式容易單元測試，不需要 mock 外部狀態
- 依賴外部狀態的函式在不同呼叫時機可能產生不同結果，難以推理
- 副作用應集中在邊界層（service、handler），不應散落在 utility function 中

## ❌ Bad

```ts
let taxRate = 0.1;

// 依賴外部狀態
function calculateTotal(price: number): number {
  return price * (1 + taxRate); // taxRate 變了結果就不同
}

// 有副作用
function formatUser(user: User): string {
  logger.log("Formatting user"); // 副作用
  return `${user.name} <${user.email}>`;
}
```

`calculateTotal` 的結果取決於外部 `taxRate`，`formatUser` 夾帶 log 副作用，讓測試需要額外 mock `logger`。

## ✅ Good

```ts
// 純函式：所有依賴都從參數傳入
function calculateTotal(price: number, taxRate: number): number {
  return price * (1 + taxRate);
}

function formatUser(user: { name: string; email: string }): string {
  return `${user.name} <${user.email}>`;
}
```

所有依賴從參數傳入，函式輸出完全由輸入決定，測試只需傳入不同參數即可驗證邏輯。
