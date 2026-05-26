---
rule: middleware-devtools-persist-order
category: Middleware
tags: [middleware, devtools, persist, order]
---

# Middleware 順序：devtools 外、persist 內

> 同時使用 `devtools` 與 `persist` 時，`devtools` 必須包在最外層、`persist` 包在內層，禁止反向嵌套。

## 原因

- `devtools` 會改寫 `setState`，為每次更新標上 action type；若它被包在內層，外層 middleware 再包一次 `setState` 會讓這些 type 遺失，所以 `devtools` 要最後套用（最外層）
- 附帶好處：`devtools` 在最外層也能觀察到包含 `persist` rehydration 在內的所有 state 變更，debug 歷史不中斷

## ❌ Bad

```ts
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

const useStore = create<State>()(
  // persist 在外、devtools 在內 — DevTools 看不到 rehydration
  persist(
    devtools((set) => ({
      /* ... */
    })),
    { name: 'my-store' },
  ),
);
```

`devtools` 被外層 `persist` 再包一次 `setState`，它標記的 action type 會遺失；連帶 storage 還原時的 state 變化也進不了 DevTools，重新整理後 history 就斷了。

## ✅ Good

```ts
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

const useStore = create<State>()(
  devtools(
    persist(
      (set) => ({
        /* ... */
      }),
      { name: 'my-store' },
    ),
  ),
);
```

DevTools 監聽 `persist` 之後的 state，rehydration 也被當成一次 state 更新紀錄下來，debug 時狀態不中斷。
