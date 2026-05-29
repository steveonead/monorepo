---
rule: type-no-enum
category: 型別設計
tags: [types, enum, as-const]
---

# 禁用 `enum`，改 `as const`

> `enum` 一律禁用，改用 `as const` 物件加 union type 推導，編譯後沒有多餘輸出。

## 原因

- `enum` 編譯成 IIFE（`(function(e){ e[e["X"]=0]="X" })(e||e={})`），有 runtime 執行成本與額外的 bundle size
- `as const` 編譯後就是普通物件，無任何額外輸出
- `as const` + `typeof` 推導的 union type 可用於所有 TypeScript 型別操作

## ❌ Bad

```ts
enum Direction {
  Up = "UP",
  Down = "DOWN",
}

function move(dir: Direction) { /* ... */ }
move(Direction.Up);
```

`enum` 會產生額外的 IIFE runtime 程式碼，且字串 literal 無法直接傳入（必須用 `Direction.Up`，不能用 `"UP"`）。

## ✅ Good

```ts
const Direction = { Up: "UP", Down: "DOWN" } as const;
type Direction = (typeof Direction)[keyof typeof Direction]; // "UP" | "DOWN"

function move(dir: Direction) { /* ... */ }
move(Direction.Up);
move("UP"); // 也可以直接傳字串 literal
```

`as const` 編譯後只剩一個普通物件，無 IIFE，推導出的 union type 接受物件屬性或字串 literal 兩種寫法。
