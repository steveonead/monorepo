---
rule: type-prefer-type-alias
category: 型別設計
tags: [types, type-alias, interface]
---

# 物件型別一律用 `type` 宣告

> 物件型別宣告一律用 `type`，禁止用 `interface`。

## 原因

- `interface` 支援 declaration merging（重複宣告同名 interface 會自動合併），在大型專案中容易造成意外的型別擴展
- `type` 語意更明確，且支援 union、intersection、mapped types、conditional types 等完整功能
- `interface` 的 declaration merging 是 TypeScript 設計給 library augmentation 用的，不是一般業務程式碼的工具

## ❌ Bad

```ts
interface User { id: string; }
interface User { name: string; } // 合法，User 自動合併為 { id: string; name: string }
// 在不同檔案中的同名 interface 也會合併，難以追蹤
```

同名 `interface` 在任何地方重新宣告都會靜默合併，大型專案中難以追蹤型別究竟從哪裡被擴展。

## ✅ Good

```ts
type User = { id: string; name: string; };
// type User = { name: string; }; // ❌ TS2300: Duplicate identifier 'User'
```

`type` 不允許重複宣告，任何意外的型別擴展都會在編譯期立刻報錯，行為更可預測。

## 例外

擴充第三方 module 必須用 `interface`：
```ts
declare module "express" {
  interface Request {
    userId?: string; // 擴充 express 的 Request 型別
  }
}
```
