---
rule: immutable-array-methods
category: 不可變與純粹
tags: [immutability, array, es2023]
---

# 用 immutable 陣列方法

> 處理陣列優先用 `map`、`filter`、`reduce`、`toSorted`、`toReversed`、`toSpliced`、`with`，禁止直接修改原陣列。

## 原因

- 直接修改原陣列會造成意料外的副作用，難以追蹤資料流
- ES2023 的 `toSorted`、`toReversed`、`toSpliced`、`with` 提供完整的 immutable 替代方案
- Immutable 操作讓函式更容易測試與推理

## ❌ Bad

```ts
const nums = [3, 1, 2];
nums.sort(); // 修改原陣列
nums.reverse(); // 修改原陣列
nums.splice(1, 1, 99); // 修改原陣列
nums[0] = 0; // 直接修改

const users = [...original];
users.sort((a, b) => a.name.localeCompare(b.name)); // 即使先 spread，sort 仍修改 users
```

即使先 spread 一份，`sort` 仍就地修改 `users`，並非 immutable 操作。

## ✅ Good

```ts
const nums = [3, 1, 2];
const sorted = nums.toSorted(); // 回傳新陣列，原陣列不變
const reversed = nums.toReversed();
const spliced = nums.toSpliced(1, 1, 99);
const updated = nums.with(0, 0);

const sortedUsers = users.toSorted((a, b) => a.name.localeCompare(b.name));
```

每個操作都回傳新陣列，原陣列保持不變，資料流清晰可追蹤。
