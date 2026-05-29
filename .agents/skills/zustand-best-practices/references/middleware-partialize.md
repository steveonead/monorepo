---
rule: middleware-partialize
category: Middleware
tags: [persist, partialize, storage, rehydration]
---

# 用 partialize 明確列出需持久化的 state

> `persist` 必須搭配 `partialize`，只保留跨 session 真正需要的 state。

## 原因

- `persist` 預設序列化整個 store，functions 被丟棄，rehydration 後 `actions` 變成 `undefined`（已知 issue #457）
- `partialize` 明確 whitelist，讓「哪些欄位跨 session 保留」一目了然，降低維護成本
- 暫時 UI state（如 modal 開關）不應跨 session 保留，放進 storage 只是噪音

## ❌ Bad

```ts
persist(
  set => ({
    theme: 'light',
    sidebarOpen: true,
    actions: { toggle: () => set(state => ({ sidebarOpen: !state.sidebarOpen })) },
  }),
  { name: 'ui-store' },
)
```

整個 store 進 storage，`actions` rehydration 後變 `undefined`，呼叫時直接 runtime error。

## ✅ Good

```ts
persist(
  set => ({
    theme: 'light',
    sidebarOpen: true,
    actions: { toggle: () => set(state => ({ sidebarOpen: !state.sidebarOpen })) },
  }),
  {
    name: 'ui-store',
    partialize: state => ({ theme: state.theme }),
  },
)
```

只有 `theme` 進 storage，`sidebarOpen` 與 `actions` 不被序列化，rehydration 後 actions 完整可用。
