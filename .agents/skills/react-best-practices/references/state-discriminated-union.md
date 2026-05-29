---
rule: state-discriminated-union
category: State 管理
tags: [typescript, state, discriminated-union]
---

# 用 discriminated union type 管理複雜 state

> 多個 boolean flag 組合出的 state 容易產生矛盾，用 discriminated union 確保狀態互斥。

## 原因

- 多個 boolean flag 允許「isLoading: true」且「isError: true」同時存在，這是邏輯矛盾
- discriminated union 讓每個狀態的可用欄位由型別系統保證，不需執行期防禦
- `switch (state.status)` 配合 `never` 可做 exhaustive check，新增狀態時編譯器會提示

## ❌ Bad

```ts
type RequestState = {
  isLoading: boolean
  isError: boolean
  data?: User
}
```

boolean flag 的排列組合遠超過合法狀態數，型別層面無法阻止矛盾組合出現。

## ✅ Good

```ts
type RequestState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: User }
  | { status: 'error'; error: Error }
```

每個狀態的欄位由型別系統嚴格限制，switch 時 TypeScript 能做完整的 narrowing。
