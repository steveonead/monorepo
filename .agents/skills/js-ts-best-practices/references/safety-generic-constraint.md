---
rule: safety-generic-constraint
category: 型別安全
tags: [safety, generics, extends]
---

# 泛型用 `extends` 限制範圍

> 宣告泛型參數時必須用 `extends` 限制形狀，禁止單純 `<T>` 後直接存取屬性。

## 原因

- 未受限的 `<T>` 讓編譯器不知道 T 有什麼屬性，存取任何屬性都會報錯或需要 `as`
- `extends` 約束讓泛型函式兼顧彈性與型別安全
- 過度限制（改用具體型別）失去泛型意義，過度寬鬆（用 `any`）失去保護

## ❌ Bad

```ts
function getName<T>(arg: T): string {
  return arg.name; // TS 報錯：Property 'name' does not exist on type 'T'
}

// 退而求其次用 any，完全失去型別保護
function getField<T>(obj: any, key: string) {
  return obj[key];
}
```

`<T>` 未加約束，編譯器無從知道 `T` 是否有 `name`，改用 `any` 則連 key 合法性都無法檢查。

## ✅ Good

```ts
function getName<T extends { name: string }>(arg: T): string {
  return arg.name; // 型別安全
}

function getField<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key]; // key 被限制為 T 的合法 key，回傳型別精確
}
```

`extends { name: string }` 保證 `T` 一定有 `name` 屬性，`K extends keyof T` 讓 key 在編譯期就被驗證合法，回傳型別也自動推斷為 `T[K]`。
