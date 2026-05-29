---
name: tailwind-best-practices
description: TailwindCSS v4 最佳實踐規則集，供撰寫、審查或重構 Tailwind 相關程式碼時參考。適用於撰寫新的 Tailwind 樣式、code review、從 v3 升級至 v4。不適用於純 TypeScript 邏輯或非 Tailwind 的 CSS 架構。
---

# TailwindCSS v4 Best Practices

涵蓋 TailwindCSS v4 設定架構、設計代幣管理、組件樣式策略、現代 CSS 功能整合、主題與狀態管理，以及響應式設計。

## 適用時機

參考這份規則集的時機：
- 撰寫新的 TailwindCSS v4 樣式
- 審查現有 Tailwind 程式碼的品質
- 將專案從 v3 升級至 v4

## 規則分類

| 分類 | 前綴 |
|------|------|
| 設定層 | `config-` |
| 設計代幣 | `token-` |
| 組件架構 | `component-` |
| 現代 CSS | `css-` |
| 主題與狀態 | `theme-` |
| RWD | `rwd-` |

## 規則速查

### 設定層

- `config-css-first` — CSS-first config，以 `@theme` 取代 `tailwind.config.js`
- `config-custom-utility` — 自訂 utility 用 `@utility`，不用 `@layer components`
- `config-no-preprocessor` — 不使用 Sass / Less / Stylus

### 設計代幣

- `token-arbitrary-promotion` — 先找內建 design token；arbitrary value 出現 3+ 次才提升為 `@theme`

### 組件架構

- `component-cn-utility` — 條件 class 用 `cn()`，不用三元字串拼接
- `component-rule-of-three` — 相同 class 組合出現 3+ 處才抽 React component
- `component-static-classname` — class 字串必須靜態完整，不動態拼接 prefix 或 suffix
- `component-apply-scope` — `@apply` 限用於 base styles 與第三方覆寫，組件複用改用 React component

### 現代 CSS

- `css-container-queries` — Container queries 用 v4 內建，不安裝 `@tailwindcss/container-queries` plugin

### 主題與狀態

- `theme-dark-mode` — 用 class-based 暗色模式，不用純 media query
- `theme-data-aria-variant` — 狀態已在 attribute 上時，用 `data-*`/`aria-*` variant 取代 JS className 計算

### RWD

- `rwd-mobile-first` — base style 是 mobile，breakpoint variant 往上疊加
- `rwd-viewport-vs-container` — Viewport breakpoint 管 page-level layout，container query 管可複用 component
- `rwd-container-query-pitfalls` — Container query 的三個常見陷阱
- `rwd-fluid-typography` — 單一元素超過 2 個 breakpoint 調同一屬性，改用 `clamp()` fluid token
- `rwd-custom-breakpoint` — 自訂 breakpoint 定義在 `@theme`，不使用 ad-hoc arbitrary breakpoint
- `rwd-testing-approach` — RWD 測試要覆蓋 breakpoint 之間的寬度，container query 確認容器實際寬度

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
