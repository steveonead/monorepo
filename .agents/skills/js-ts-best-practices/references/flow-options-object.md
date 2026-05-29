---
rule: flow-options-object
category: 控制流程
tags: [flow, function, options-object]
---

# 參數超過三個改物件傳遞

> 函式參數超過三個，改用單一 options 物件，並在型別上標清楚必填與選填。

## 原因

- 參數多時呼叫端難以判斷每個位置對應什麼
- Options 物件讓每個參數自帶名稱，降低傳錯順序的風險
- 選填參數用 `?` 明確標示，不需要傳遞 `undefined` 佔位

## ❌ Bad

```ts
function createUser(name: string, email: string, age: number, role: string) {
  // ...
}
createUser("Alice", "alice@example.com", 30, "admin");
```

呼叫端四個位置參數，難以判斷順序是否正確，`role` 若為選填還需傳入 `undefined` 佔位。

## ✅ Good

```ts
type CreateUserOptions = {
  name: string;
  email: string;
  age: number;
  role?: string;
};

function createUser(options: CreateUserOptions) {
  // ...
}
createUser({ name: "Alice", email: "alice@example.com", age: 30 });
```

每個參數有名稱，呼叫端不需猜測順序。選填參數直接省略，不需 `undefined` 佔位，新增參數也不影響現有呼叫端。
