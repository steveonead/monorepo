---
name: zustand-best-practices
description: Zustand v5 最佳實踐規則集，供撰寫、審查或重構 Zustand 相關程式碼時參考。適用於純 SPA 環境，不含 SSR/Next.js。
---

# Zustand v5 Best Practices

涵蓋 store 設計、效能、middleware 組合、TypeScript 型別與測試。以純 SPA 環境為前提，v5 API 為基準。

## 適用時機

- 撰寫新的 Zustand store 或 selector
- 審查現有 store 的架構與效能問題
- 從 v4 升級至 v5

## 規則分類

| 分類 | 前綴 |
|------|------|
| Store 設計 | `store-` |
| 效能 | `perf-` |
| Middleware | `middleware-` |
| TypeScript | `ts-` |
| 測試 | `test-` |

## 規則速查

### Store 設計

- `store-actions-object` — 所有 action 集中在 store 的 `actions` 物件，訂閱 `actions` 不觸發 re-render
- `store-module-level-action` — React 元件外呼叫 action 改用 module-level function
- `store-no-fetching` — Zustand 只管 client state，server state 交給 TanStack Query
- `store-initial-state` — store 初始 state 抽成獨立常數或用 `getInitialState()`，`reset` action 引用同一來源
- `store-domain-split` — 依 domain 邊界拆分 store，命名統一為 `use[Domain]Store`
- `store-derived-selector` — 可由現有 state 推導的值用 selector 計算，不存入 store
- `store-no-direct-mutate` — `set()` 內回傳新物件，禁止直接 mutate state

### 效能

- `perf-selector-subscription` — 以 selector 精準訂閱，封裝成 custom hook
- `perf-pure-selector` — Selector 只取原始值，`.map`/`.filter` 等轉換放 hook 層配合 `useMemo`
- `perf-atomic-subscription` — 多個值預設各自訂閱，只在需要以單一物件傳遞時才用 `useShallow`

### Middleware

- `middleware-ordering` — middleware 順序：`devtools` 最外、`persist` 次之、`immer` 最內
- `middleware-partialize` — 用 `partialize` 明確指定需要持久化的 state，暫時 UI state 與 actions 不進 storage
- `middleware-devtools-config` — devtools 設定 `enabled: process.env.NODE_ENV === 'development'`，並給予語意化 `name`

### TypeScript

- `ts-curry-syntax` — TypeScript 用雙括號 curry 語法 `create<T>()()`，單括號在有 middleware 時型別失效
- `ts-equality-fn` — v5 `create()` 不接受 equalityFn 參數，需要 store 層級 equality 時改用 `createWithEqualityFn`
- `ts-module-singleton` — store 必須在 module top-level 宣告，禁止在元件或 hook 內呼叫 `create()`

## 使用方式

讀取個別規則檔案以取得詳細說明與範例：

```
references/[類別前綴]-[規則名稱].md
```

每個規則檔案包含：
- 說明此規則重要的原因
- 不建議的寫法（含說明）
- 建議的寫法（含說明）
- 例外情境（如有白名單）
