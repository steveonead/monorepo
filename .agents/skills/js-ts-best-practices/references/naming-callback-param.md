---
rule: naming-callback-param
category: 命名與可讀性
tags: [naming, callback, parameter]
---

# Callback 參數禁用單字母或縮寫

> Callback 參數一律給完整且有語意的名稱，禁止 `e`、`x`、`oi` 這類縮寫。

## 原因

- 縮寫參數讓讀者無法從名稱理解資料的業務意義
- 完整名稱在 code review 與搜尋時更容易辨認

## ❌ Bad

```ts
users.filter((u) => u.active);
events.forEach((e) => console.log(e.type));
Object.entries(config).map(([k, v]) => ({ key: k, value: v }));
```

`u`、`e`、`k`、`v` 沒有業務語意，讀者需要往上追蹤才能理解資料型態。

## ✅ Good

```ts
users.filter((user) => user.active);
events.forEach((event) => console.log(event.type));
Object.entries(config).map(([key, value]) => ({ key, value }));
```

完整名稱讓讀者一眼看出參數代表什麼，不需要額外的上下文推斷。
