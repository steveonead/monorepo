---
name: react-best-practices
description: React 19 + TypeScript 最佳實踐規則集，供撰寫、審查或重構 React 元件時參考。適用於撰寫新元件、code review、重構現有邏輯。不適用於非 React 情境（Node.js、純 TypeScript library）。
---

# React Best Practices

涵蓋元件設計、State 管理、Hooks 用法、React Compiler、React 19 新 API、Bundle 與效能、架構七大面向。

## 適用時機

參考這份規則集的時機：
- 撰寫新的 React 元件或 custom hook
- 審查現有元件的品質
- 重構或最佳化現有程式碼

## 規則分類

| 分類 | 前綴 |
|------|------|
| 元件設計 | `comp-` |
| State 管理 | `state-` |
| Hooks 用法 | `hooks-` |
| React Compiler | `compiler-` |
| React 19 新 API | `react19-` |
| Bundle 與效能 | `perf-` |
| 架構 | `arch-` |

## 規則速查

### 元件設計

- `comp-no-nested-component` — 不在 render 函式內定義子元件
- `comp-props-type` — Props 用 `type`，解構預設值取代 `defaultProps`
- `comp-single-responsibility` — 元件只做一件事，超過 300 行是分解訊號
- `comp-clean-jsx-logic` — JSX 不放過多邏輯判斷，複雜 chain 與 inline function 抽離
- `comp-no-boolean-prop-accumulation` — 用 variant 或明確子元件取代 boolean prop 堆疊
- `comp-compound-use-context` — Compound component 搭配 `use()` 共享 context
- `comp-prefer-children` — 優先用 `children`，render props 只在需傳資料給子層時使用

### State 管理

- `state-discriminated-union` — 用 discriminated union type 管理複雜 state
- `state-client-server-separation` — Client state 與 Server state 嚴格分離
- `state-derived-from-source` — 衍生狀態從既有 state 計算，不用 `useEffect` 同步

### Hooks 用法

- `hooks-functional-update` — functional state update 處理依賴前一 state 的更新
- `hooks-effect-external-only` — `useEffect` 只用於同步外部系統
- `hooks-ref-transient-value` — `useRef` 存放不需觸發 re-render 的瞬態值
- `hooks-custom-hook-extraction` — 同一組 stateful logic 超過一個元件時抽成 custom hook

### React Compiler

- `compiler-annotation-opt-in` — 以 `'use memo'` opt-in React Compiler 最佳化
- `compiler-pure-render` — Render 函式必須為純函式

### React 19 新 API

- `react19-use-optimistic-scope` — 優先用 TanStack Query 的 optimistic mutation，不適用時才用 `useOptimistic`
- `react19-use-transition-non-urgent` — `useTransition` 標記非緊急的 component-level state 更新
- `react19-use-deferred-value` — `useDeferredValue` 延遲低優先級渲染，取代手動 debounce

### Bundle 與效能

- `perf-no-barrel-export` — 避免 barrel exports，直接 import 模組路徑
- `perf-virtualize-long-list` — 長列表用 virtualization，不一次 render 100+ DOM 節點

### 架構

- `arch-feature-first-structure` — Feature-first 資料夾結構，不按技術類型分類
- `arch-queries-stores-in-feature` — Queries 與 Stores 屬 feature 範疇，放 feature 目錄下

## 使用方式

讀取個別規則檔案以取得詳細說明與範例：

```
references/[類別前綴]-[規則名稱].md
```

每個規則檔案包含：
- 說明此規則重要的原因
- 不建議的寫法（含說明）
- 建議的寫法（含說明）
- 補充說明與參考
