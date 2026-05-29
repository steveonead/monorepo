---
rule: immutable-deep-clone
category: 不可變與純粹
tags: [immutability, clone, structuredClone]
---

# 深層複製用 `structuredClone` 或 `cloneDeep`

> 需要深層複製時用 `structuredClone`，含 Function 或 class instance 時改用 `es-toolkit` 的 `cloneDeep`，禁止 `JSON.parse(JSON.stringify(...))` 與 spread 假裝深複製。

## 原因

- `JSON.parse(JSON.stringify(...))` 無法處理 `Date`、`Map`、`Set`、`undefined`，且循環引用會拋例外
- Spread（`{...obj}`）只做淺複製，巢狀物件仍是共享參考
- `structuredClone` 是全域函式（瀏覽器/Node.js 18+ 均可用），支援 `Date`、`Map`、`Set`、循環引用

## ❌ Bad

```ts
// JSON 方式丟失 Date，循環引用報錯
const clone1 = JSON.parse(JSON.stringify(obj));

// spread 只是淺複製
const clone2 = { ...deepNestedObj };
clone2.nested.value = 1; // 仍會修改 deepNestedObj.nested.value
```

`JSON.parse(JSON.stringify(...))` 會把 `Date` 轉成字串、`undefined` 消失、`Map`/`Set` 變成 `{}`。spread 的巢狀屬性仍指向同一個參考。

## ✅ Good

```ts
// 一般 plain object
const clone = structuredClone(obj); // 支援 Date、Map、Set、循環引用

// 含 Function 或 class instance 時，改用 cloneDeep
import { cloneDeep } from "es-toolkit";
const clone = cloneDeep(objWithMethods);
```

`structuredClone` 正確處理絕大多數情境，含 Function 或 class instance 的物件則用 `cloneDeep` 補足。

## 例外

`structuredClone` 不支援：
- `Function` — 會拋 `DataCloneError`
- Class instance — prototype chain 丟失，clone 後為 plain object
- `Symbol` 值

這類物件改用 `es-toolkit` 的 `cloneDeep`。
