---
rule: css-container-queries
category: 現代 CSS
tags: [現代 CSS, container-queries, v4, plugin]
---

# Container Queries 用 v4 內建，不安裝 Plugin

> v4 已將 container query 支援納入核心，不需要也不應安裝 `@tailwindcss/container-queries`。

## 原因

- Tailwind v4 官方聲明：「We've brought container query support into core for v4.0, so you don't need the @tailwindcss/container-queries plugin anymore」。
- v4 內建新增了 `@max-*` 與 `@min-*` 範圍 variant，是 v3 plugin 沒有的功能。
- 在 v4 專案中安裝舊 plugin 可能造成 class 衝突或重複定義。

## ❌ Bad

```json
{
  "dependencies": {
    "@tailwindcss/container-queries": "^0.1.1"
  }
}
```

```css
/* 安裝 plugin 在 v4 是多餘的，且可能衝突 */
@plugin "@tailwindcss/container-queries";
```

v4 專案不需要安裝此 plugin，手動引入會與內建實作衝突。

## ✅ Good

```tsx
{/* 直接使用，不需要任何 plugin */}
<div className="@container">
  <div className="grid grid-cols-1 @sm:grid-cols-2 @lg:grid-cols-3 gap-4">
    {items.map((item: CardItem) => (
      <Card key={item.id} {...item} />
    ))}
  </div>
</div>
```

父元素加 `@container`，子元素直接使用 `@sm:`、`@md:`、`@lg:` variant，v4 開箱即用。若需要範圍查詢，可使用 `@max-md:` 或 `@min-sm:@max-lg:` 語法，這是 plugin 版本沒有的能力。
