---
rule: type-infer-no-redundant
category: 型別設計
tags: [types, inference, annotation]
---

# 讓 TS 推斷，禁冗餘標註

> TypeScript 能推斷的型別就不要手動標註，標註只用在 TS 推不出來、公開 API 契約、或啟用 `isolatedDeclarations` 的情境。

## 原因

- 冗餘標註讓程式碼更冗長，且型別改動時需要同步修改標註
- TypeScript 的型別推斷已足夠強大，大多數局部變數、回傳值都不需要標註

## ❌ Bad

```ts
const count: number = 0;
const name: string = "Alice";
const fn: (x: number) => string = (x) => x.toString();

function add(a: number, b: number): number {
  return a + b; // 回傳型別 TS 可以推斷
}
```

這些標註全部是 TS 能自動推斷的，寫了只是增加噪音，修改型別時還要改兩個地方。

## ✅ Good

```ts
const count = 0;
const name = "Alice";
const fn = (x: number) => x.toString();

function add(a: number, b: number) {
  return a + b;
}

// 公開 API 契約需標註（讓呼叫端看到明確型別）
export function createUser(name: string): User { /* ... */ }
```

局部變數與私有函式讓 TS 自己推斷，公開 API 標註回傳型別，呼叫端一眼看出契約。

## 例外

- 公開 API（exported function/type）標註回傳型別，讓呼叫端一眼看出契約
- `isolatedDeclarations`（TypeScript 5.5+）啟用時，所有 exported symbol 必須明確標註
- TS 無法正確推斷（如複雜 overload、遞迴型別）
