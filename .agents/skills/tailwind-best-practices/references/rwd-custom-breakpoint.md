---
rule: rwd-custom-breakpoint
category: RWD
tags: [rwd, breakpoint, theme, arbitrary-value, custom-token]
---

# 自訂 breakpoint 定義在 `@theme`，不使用 ad-hoc arbitrary breakpoint

> 同一個 `min-[1400px]:` 在多處重複出現，是需要提升為 `@theme` token 的訊號。

## 原因

- `@theme` 中的 `--breakpoint-*` token 自動生成對應 variant（如 `3xl:`），與內建 breakpoint 行為完全一致。
- Ad-hoc arbitrary breakpoint 分散在各 component，修改時需全域搜尋替換。
- 每多一個 breakpoint，每個 component 就多一個維度；加入前確認設計系統有明確指定。

## ❌ Bad

```tsx
{/* ad-hoc arbitrary breakpoint，分散在各 component */}
<div className="min-[1400px]:grid-cols-5" />
<div className="min-[1400px]:gap-8" />
<div className="min-[1400px]:text-xl" />
```

三個不同 component 各自寫死 `min-[1400px]:`，設計稿一旦調整這個寬度就要逐一修改。

## ✅ Good

```css
/* 定義在 @theme，自動生成 3xl: variant */
@theme {
  --breakpoint-3xl: 87.5rem; /* 1400px */
}
```

```tsx
{/* 統一用 token variant，語義清楚，修改只改一處 */}
<div className="3xl:grid-cols-5" />
<div className="3xl:gap-8" />
<div className="3xl:text-xl" />
```

`--breakpoint-3xl` 定義後，Tailwind 自動生成 `3xl:` variant，用法與 `lg:`、`xl:` 完全相同。
