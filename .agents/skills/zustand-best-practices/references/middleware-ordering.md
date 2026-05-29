---
rule: middleware-ordering
category: Middleware
tags: [devtools, persist, immer, ordering]
---

# Middleware 包裝順序：devtools 最外、persist 次之、immer 最內

> 永遠使用 `devtools(persist(immer(...)))` 的順序，不要顛倒。

## 原因

- `devtools` 必須在最外層才能捕捉所有 `setState` 呼叫（包含 `persist` 的 rehydration 事件）並標上 action type
- `persist` 在 `devtools` 內層時，rehydration 觸發的 state 更新不會出現在 Redux DevTools 記錄中
- 官方 `middlewareTypes.test.tsx` 所有範例均採用此順序

## ❌ Bad

```ts
create<Store>()(
  persist(
    devtools(immer(set => ({ count: 0, increment: () => set(state => { state.count++ }) })), { name: 'MyStore' }),
    { name: 'my-store' },
  ),
)
```

`devtools` 在 `persist` 內層，rehydration 事件不出現在 DevTools，無法追蹤跨 session 的 state 還原。

## ✅ Good

```ts
create<Store>()(
  devtools(
    persist(
      immer(set => ({
        count: 0,
        increment: () => set(state => { state.count++ }),
      })),
      { name: 'my-store' },
    ),
    { name: 'MyStore', enabled: process.env.NODE_ENV === 'development' },
  ),
)
```

`devtools` 在最外層，所有 state 變更（含 rehydration）都被記錄，DevTools 的 action history 完整可讀。

## 例外

「devtools 放最後」是官方舊文件中的說法，意指「最後處理 setState 的那一層」，也就是程式碼中的最外層，容易被誤讀為最內層，忽略此說法即可。
