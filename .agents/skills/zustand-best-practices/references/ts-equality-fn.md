---
rule: ts-equality-fn
category: TypeScript
tags: [typescript, equality, createWithEqualityFn]
---

# v5 `create` 不支援自訂 equality function

> v5 `create` 回傳的 hook 不再接受第二個 equality 參數，需要 store 層級自訂 equality 時改用 `createWithEqualityFn`。

## 原因

- v4 在 hook 呼叫端傳 `useStore(selector, shallow)` 自訂比較，v5 直接忽略此參數，equality 不生效。
- `createWithEqualityFn` 從 `zustand/traditional` 匯入，回傳的 hook 才接受第二個 equality 參數，並需安裝 `use-sync-external-store` peer dependency。

## ❌ Bad

```ts
import { shallow } from 'zustand/shallow'

const data = useStore((state) => ({ count: state.count, name: state.name }), shallow)
```

v5 的 hook 簽名不含 equality 參數，`shallow` 被忽略，比較行為與預期不符。

## ✅ Good

```ts
import { createWithEqualityFn } from 'zustand/traditional'
import { shallow } from 'zustand/shallow'

const useStore = createWithEqualityFn<Store>()((set) => ({ count: 0, name: '' }))

const { count, name } = useStore((state) => ({ count: state.count, name: state.name }), shallow)
```

`createWithEqualityFn` 回傳的 hook 接受第二個 equality 參數，`shallow` 正常生效。
