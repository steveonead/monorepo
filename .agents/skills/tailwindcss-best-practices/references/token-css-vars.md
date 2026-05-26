---
rule: token-css-vars
category: Design Tokens
tags: [token, css-variables, theme-function]
---

# 用 var(--color-blue-500) 取代 theme('colors.blue.500')

> 在自訂 CSS 中取用 design token，改用 v4 自動暴露的 CSS 變數 `var(--color-blue-500)`，不再用 `theme('colors.blue.500')` 函式。

## 原因

- v4 把 `@theme` 內所有 token 自動暴露成 `:root` 上的 CSS 變數，直接 `var()` 取用最直接
- v3 的點記法 `theme('colors.blue.500')` 在 v4 已標為 deprecated，官方建議改用 CSS 變數
- CSS 變數可在執行期被 media query、`.dark` class 或 JS 改寫，`theme()` 取的是 build time 固定值

## ❌ Bad

```css
.alert {
  /* v3 點記法已 deprecated，且為 build time 固定值，無法執行期覆蓋 */
  background-color: theme('colors.blue.500');
  margin-block: theme('spacing.4');
}
```

## ✅ Good

```css
.alert {
  /* 直接用 v4 暴露的 CSS 變數 */
  background-color: var(--color-blue-500);
  margin-block: var(--spacing-4);
}
```

## 例外

build time 要對 token 做數值運算（`var()` 不適用的場合）才用 `theme()`，且語法是 CSS 變數名 `theme(--spacing-4)`，不是點記法：

```css
.box {
  width: calc(theme(--spacing-4) * 2);
}
```
