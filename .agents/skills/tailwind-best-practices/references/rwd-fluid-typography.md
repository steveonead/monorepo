---
rule: rwd-fluid-typography
category: RWD
tags: [rwd, fluid, typography, clamp, css-variable, theme]
---

# 單一元素超過 2 個 breakpoint 調同一屬性，改用 `clamp()` fluid token

> 多個 breakpoint 疊加同一屬性是加 fluid token 的訊號，`clamp()` 一行替代整排 breakpoint variant。

## 原因

- 同一個屬性出現 3 個以上 breakpoint variant，每新增一個 component 都要複製這整排 class。
- `clamp()` 讓值在兩個端點之間平滑縮放，不產生突變，視覺體驗更好。
- 定義在 `@theme` 的 token 可全專案共用，修改時只改一處。

## ❌ Bad

```tsx
{/* 四個 breakpoint 調同一個 font-size，每個 component 都多四個維度 */}
<h1 className="text-sm md:text-base lg:text-lg xl:text-xl">
  標題
</h1>
```

每次需要這個 heading 尺寸，就得複製這四個 class，日後設計改動要逐一修改。

## ✅ Good

```css
/* @theme 定義 fluid token */
@theme {
  --text-fluid-lg: clamp(1.25rem, 2vw + 0.5rem, 2rem);
}
```

```tsx
{/* 引用 token，一行搞定，所有螢幕尺寸自動適配 */}
<h1 className="text-(--text-fluid-lg)">
  標題
</h1>
```

`text-(--text-fluid-lg)` 是 v4 CSS 變數引用語法，等同於 `font-size: var(--text-fluid-lg)`，token 集中在 `@theme` 管理。
