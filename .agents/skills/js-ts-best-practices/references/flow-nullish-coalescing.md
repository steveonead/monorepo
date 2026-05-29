---
rule: flow-nullish-coalescing
category: 控制流程
tags: [flow, nullish, optional-chaining]
---

# 用 `?.` 與 `??`，避開 `||` 的 falsy 陷阱

> 存取可能為 null/undefined 的屬性用 `?.`，提供預設值用 `??`，禁止用 `||` 提供預設值。

## 原因

- `||` 在所有 falsy 值（`0`、`''`、`false`）都會取右側，導致合法的 `0` 或空字串被覆蓋
- `??` 只在 `null` 或 `undefined` 才取右側，語意精確
- `?.` 可安全鏈式存取深層屬性，不用層層 `&&` 防守

## ❌ Bad

```ts
const port = config.port || 3000; // config.port = 0 時錯誤地取 3000
const name = user && user.profile && user.profile.name;
```

`||` 的 falsy 語意讓合法的 `0`、`false`、`''` 被預設值覆蓋，`&&` 鏈式防守冗長且難讀。

## ✅ Good

```ts
const port = config.port ?? 3000; // config.port = 0 時正確保留 0
const name = user?.profile?.name;
```

`??` 語意精確，只對 `null`/`undefined` 生效。`?.` 讓深層存取簡潔且安全。
