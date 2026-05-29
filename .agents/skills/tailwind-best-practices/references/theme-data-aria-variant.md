---
rule: theme-data-aria-variant
category: 主題與狀態
tags: [主題與狀態, data-attributes, aria, variant, radix, shadcn]
---

# 狀態在 Attribute 上時，用 `data-*`/`aria-*` Variant

> attribute 已有狀態時，直接用 variant 讀取，不在 JS 另外計算 className。

## 原因

- 避免 JS 狀態與 CSS 狀態雙重管理：attribute 上已有狀態，className 裡再用 JS 計算一次，兩者容易不同步。
- 與 shadcn/ui、Radix UI 的 `data-state` 模式一致，減少額外橋接邏輯。
- `aria-*` variant 直接讀取無障礙屬性的值，語意更精確。

## ❌ Bad

```tsx
{/* aria-expanded 已有狀態，卻又用 JS 重算 className */}
<button
  aria-expanded={open}
  className={cn("text-gray-600", open && "text-blue-600")}
>
  展開
</button>
```

`open` 狀態已反映在 `aria-expanded` 上，再透過 `cn()` 條件切換 class 是重複管理，修改邏輯時需要同步兩個地方。

## ✅ Good

```tsx
{/* 直接用 aria-* variant，讀 attribute 上的狀態 */}
<button
  aria-expanded={open}
  className="text-gray-600 aria-expanded:text-blue-600"
>
  展開
</button>

{/* Radix UI / shadcn 的 data-state pattern */}
<div
  data-state={open ? "open" : "closed"}
  className="opacity-0 transition-opacity data-[state=open]:opacity-100"
>
  面板內容
</div>
```

`aria-expanded:text-blue-600` 直接對應 `[aria-expanded="true"]` 選擇器，狀態來源只有一個。`data-[state=open]:opacity-100` 讀取 Radix 設置的 `data-state` attribute，不需要另外管理 CSS class。

## 例外

若同一個 `data-[state=open]` 在多個元件重複出現，用 `@custom-variant` 定義為自訂 variant，避免寫法散落：

```css
@custom-variant open (&[data-state="open"]);
```

```tsx
{/* 之後可直接寫 open:opacity-100 */}
<div className="opacity-0 open:opacity-100">面板內容</div>
```
