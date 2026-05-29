---
rule: type-no-any
category: 型別設計
tags: [types, any, unknown]
---

# 禁用 `any`，改 `unknown`

> 型別真正未知時用 `unknown` 而非 `any`，`unknown` 強制先做 narrowing 才能存取屬性。

## 原因

- `any` 完全關閉型別檢查，錯誤直到 runtime 才被發現
- `unknown` 保留型別保護，強制呼叫端先確認型別再使用
- 用 `any` 的地方幾乎都可以改成 `unknown` 加 narrowing，或使用泛型

## ❌ Bad

```ts
function process(input: any) {
  return input.name.toUpperCase(); // 無型別保護，runtime 可能 crash
}
```

`any` 讓 TypeScript 完全放棄檢查，`input.name` 可能不存在，`.toUpperCase()` 可能不是函式，全部到 runtime 才會爆。

## ✅ Good

```ts
function process(input: unknown): string {
  if (
    typeof input === "object" &&
    input !== null &&
    "name" in input &&
    typeof (input as { name: unknown }).name === "string"
  ) {
    return (input as { name: string }).name.toUpperCase();
  }
  throw new Error("Invalid input");
}
```

`unknown` 強制先做 narrowing，每一步都有型別保護，錯誤在編譯期就能被發現。

## 例外

- ESLint 規則停用（`// eslint-disable-next-line @typescript-eslint/no-explicit-any`）需附上說明
- 第三方套件型別定義不足、無法避免時允許，但應限縮到最小範圍
