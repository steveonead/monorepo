---
rule: middleware-devtools-config
category: Middleware
tags: [devtools, production, naming, bundle]
---

# DevTools 設定 enabled 條件與語意化 name

> `devtools` 必須設定 `enabled: process.env.NODE_ENV === 'development'` 並給予語意化名稱。

## 原因

- 未設定 `enabled`，production 環境仍有 DevTools 行為，洩漏 state 結構給使用者
- 語意化 `name` 讓 Redux DevTools 的 action history 可讀，否則顯示預設值難以辨識
- `enabled: false` 讓 middleware 不作用，但程式碼仍在 bundle 中；bundle size 敏感時改用條件式包裝

## ❌ Bad

```ts
type CartState = {
  items: string[]
  actions: {
    addItem: (item: string) => void
    clearItems: () => void
  }
}

export const useCartStore = create<CartState>()(
  devtools((set) => ({
    items: [],
    actions: {
      addItem: (item) => set((state) => ({ items: [...state.items, item] })),
      clearItems: () => set({ items: [] }),
    },
  })),
)
```

production 仍有 DevTools 行為，store 名稱顯示為預設值，每個 action 在 Redux DevTools 均顯示為 `anonymous`，無法從 action history 判斷是哪個操作觸發了狀態變更。

## ✅ Good

```ts
type CartState = {
  items: string[]
  actions: {
    addItem: (item: string) => void
    clearItems: () => void
  }
}

export const useCartStore = create<CartState>()(
  devtools(
    (set) => ({
      items: [],
      actions: {
        addItem: (item) =>
          set(
            (state) => ({ items: [...state.items, item] }),
            undefined,
            'cart/addItem',
          ),
        clearItems: () => set({ items: [] }, undefined, 'cart/clearItems'),
      },
    }),
    {
      name: 'CartStore',
      enabled: process.env.NODE_ENV === 'development',
    },
  ),
)
```

production DevTools 停用，每個 `set()` 的第三個參數帶有語意化名稱，Redux DevTools 的 action history 清楚反映業務操作。第二個參數傳 `undefined` 而非 `false`，保留預設的 replace 行為。

## 例外

bundle size 敏感的情境，改用條件式：

```ts
const useStore = process.env.NODE_ENV === 'development'
  ? create<Store>()(devtools(fn, { name: 'CartStore' }))
  : create<Store>()(fn)
```

devtools 程式碼完全不進 production bundle。
