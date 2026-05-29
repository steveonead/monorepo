---
rule: ts-curry-syntax
category: TypeScript
tags: [typescript, create, middleware, type-inference]
---

# TypeScript 使用雙括號 Curry 語法

> 在 TypeScript 中呼叫 `create<T>()()` 雙括號，單括號加 middleware 後型別推斷失效。

## 原因

- TypeScript issue #10571 的 workaround：顯式傳入 `T` 的同時，讓編譯器對 middleware mutator types 做推斷
- 官方 Advanced TypeScript Guide 明確要求此語法，v5 所有官方範例均採用雙括號
- 單括號在沒有 middleware 時表面上能用，但加入 `immer`、`devtools` 等後型別立刻失效

## ❌ Bad

```ts
const useStore = create<MyState>(set => ({ count: 0 }))
```

單括號語法在加入 middleware 後型別失效，編譯器無法同時對 `T` 與 middleware mutator types 做推斷。

## ✅ Good

```ts
const useStore = create<MyState>()((set) => ({ count: 0 }))
```

雙括號讓 TypeScript 先固定 `T`，再對 `set`、middleware 的型別做完整推斷，是 v5 唯一正確寫法。
