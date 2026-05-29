---
rule: config-custom-utility
category: config
tags: [config, utility, layer, v4, custom-class]
---

# 自訂 utility 用 `@utility`，不用 `@layer components`

> 自訂可複用 utility class 要用 `@utility`，`@layer components` 在 v4 語義已改變。

## 原因

- v4 的 `@layer` 是真實 CSS cascade layer，優先順序由瀏覽器 cascade 規則決定，與 v3 的行為完全不同。
- `@utility` 定義的 class 參與 Tailwind 的屬性排序機制，可被其他 utility 正常覆蓋。
- 用 `@layer components` 定義自訂 utility 會導致 specificity 問題，其他 utility class 無法覆蓋它。

## ❌ Bad

```css
/* 用 @layer components 定義自訂 utility，無法被其他 utility 覆蓋 */
@layer components {
  .btn {
    padding: 0.5rem 1rem;
  }
}
```

```tsx
{/* px-8 無法覆蓋 .btn 的 padding，因為 cascade layer 優先順序問題 */}
<button className="btn px-8">Submit</button>
```

## ✅ Good

```css
/* @utility 定義的 class 可被其他 utility 覆蓋 */
@utility btn {
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
}
```

```tsx
{/* px-8 可正常覆蓋 btn 的 padding */}
<button className="btn px-8">Submit</button>
```

`@utility` 讓自訂 class 的行為與內建 utility 一致，組合時不會有覆蓋失效的問題。

## 例外

覆寫第三方套件樣式（如 Prose、Datepicker）或定義全域 base styles 時，`@layer base` / `@layer components` 仍是正確做法。這條規則聚焦在「自訂可複用 utility」的場景。
