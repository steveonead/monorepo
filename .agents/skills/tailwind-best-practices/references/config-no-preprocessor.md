---
rule: config-no-preprocessor
category: config
tags: [config, sass, less, stylus, preprocessor, v4]
---

# 不使用 Sass / Less / Stylus

> Tailwind CSS v4 不相容 CSS preprocessor，改用原生 CSS 能力取代所有 Sass 功能。

## 原因

- 官方文件明確說明：「Tailwind CSS v4.0 is not designed to be used with CSS preprocessors like Sass, Less, or Stylus」。
- v4 內建 Lightning CSS，原生處理 nesting、`@import` bundling 與 vendor prefix，不需要 preprocessor。
- 混用 Sass 會導致 v4 的 CSS 解析管線衝突，產生不可預期的編譯結果。

## ❌ Bad

```scss
/* ❌ v4 專案混用 Sass */
$brand: #4F46E5;

.btn {
  background: $brand;

  &:hover {
    background: darken($brand, 10%);
  }
}
```

Sass 變數與 `darken()` 函式是 Sass 專屬語法，在 v4 的 Lightning CSS 管線中無法正確處理。

## ✅ Good

```css
/* ✅ 使用 v4 原生能力 */
@theme {
  --color-brand: oklch(0.55 0.18 264);
}

.btn {
  background-color: var(--color-brand);

  &:hover {
    background-color: color-mix(in oklch, var(--color-brand) 90%, black);
  }
}
```

CSS 變數取代 Sass 變數，`color-mix()` 取代 `darken()`，原生 CSS nesting 由 Lightning CSS 處理。自訂 variant 用 `@custom-variant`，自訂 utility 用 `@utility`，數學運算用 `calc()` / `min()` / `max()`。
