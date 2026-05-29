---
rule: token-arbitrary-promotion
category: 設計代幣
tags: [design-token, arbitrary-value, theme, tailwind-v4]
---

# 先找內建 token，arbitrary value 出現 3 次才提升為 `@theme`

> 不要跳過設計系統直接用 arbitrary value，重複使用的 value 提升為 `@theme` token 統一管理。

## 原因

- Tailwind 內建 token 覆蓋大多數設計需求，arbitrary value 應是例外而非常態。
- 同一個 arbitrary value 散落多處，修改時需全文搜尋替換，容易遺漏。
- `@theme` token 讓整個設計系統的 spacing、color 集中在一處，維護成本低。

## ❌ Bad

```tsx
{/* 直接用 arbitrary，跳過設計系統，出現三次卻未提升 */}
<header className="mt-[37px]">標題區塊</header>
<nav className="mt-[37px]">導覽列</nav>
<main className="mt-[37px]">主要內容</main>
```

每次需要調整 37px 都要搜尋三個地方，且無法透過 token 名稱傳達語意。

## ✅ Good

```css
/* Step 1：先確認內建 token（如 mt-9、mt-10）是否符合設計稿 */
/* Step 2：確實沒有對應 token 時，第一、二次用 arbitrary value */
/* Step 3：出現第三次時，提升為 @theme token */
@theme {
  --spacing-header: 37px;
}
```

```tsx
{/* 之後統一引用 token，語意清楚且改一處全套用 */}
<header className="mt-(--spacing-header)">標題區塊</header>
<nav className="mt-(--spacing-header)">導覽列</nav>
<main className="mt-(--spacing-header)">主要內容</main>
```

括號語法 `mt-(--spacing-header)` 是 Tailwind v4 引用 CSS 變數的正式寫法。

## 例外

「3 次」是社群慣例門檻，團隊可依實際情況調整（如 2 次或 4 次）。一次性的像素微調（如單一元件的視覺對齊）可保留為 arbitrary value，不需強制提升。
