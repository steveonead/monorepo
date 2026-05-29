---
rule: config-css-first
category: config
tags: [config, theme, v4, css-first, design-tokens]
---

# CSS-first config，以 `@theme` 取代 `tailwind.config.js`

> v4 以 `@import "tailwindcss"` + `@theme {}` 為標準配置方式，不再需要 `tailwind.config.js`。

## 原因

- v4 採用 CSS-first 架構，設計 token 直接定義在 CSS 中，與元件樣式共存於同一語境。
- v4 自動掃描所有檔案，移除 `content` 陣列的手動維護負擔。
- `tailwind.config.js` 在 v4 僅為 backward-compat 用途，新專案引入會造成配置分裂。

## ❌ Bad

```js
// tailwind.config.js（v4 新專案不需要此檔案）
module.exports = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: { brand: '#4F46E5' }
    }
  }
}
```

顏色以 hex 定義，無法利用 oklch 的感知均勻特性，且配置分散在 JS 檔案而非 CSS 中。

## ✅ Good

```css
/* globals.css */
@import 'tailwindcss';

@theme {
  --color-brand: oklch(0.55 0.18 264);
  --font-display: 'Satoshi', sans-serif;
}
```

設計 token 全部定義在 `@theme`，顏色用 oklch，字體在同一位置管理。token 會自動轉換為對應的 utility class（如 `text-brand`、`bg-brand`）。

## 例外

從 v3 升級的既有專案，可保留 `tailwind.config.js` 作為過渡期配置，但應列入技術債並逐步遷移至 `@theme`。
