---
rule: component-apply-scope
category: 組件架構
tags: [component, apply, reuse]
---

# `@apply` 限用於 base styles 與第三方覆寫

> 組件複用改用 React component；`@apply` 保留給 `@layer base` 全域樣式與第三方套件覆寫。

## 原因

- `@apply` 把 utility 的語意隱藏在 CSS 檔案裡，呼叫方看不到實際套了哪些樣式
- 組件複用用 React component，單一真實來源在 JSX，而不是 CSS
- 第三方套件（Prose、Datepicker 等）只暴露 HTML 結構，無法加 className，是 `@apply` 的正當使用場景

## ❌ Bad

```css
/* 用 @apply 做組件複用，隱藏了樣式契約 */
@utility card {
  @apply rounded-xl bg-white shadow-md p-6;
}
```

```tsx
<div className="card">內容</div>
```

呼叫方無法從 JSX 判斷 `card` 套了哪些樣式，也無法用 utility override。

## ✅ Good

```tsx
function Card({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("rounded-xl bg-white shadow-md p-6", className)}>
      {children}
    </div>
  );
}
```

樣式直接寫在 JSX，接受 `className` prop 保留覆蓋空間。

## 例外

第三方套件樣式覆寫或全域 base styles，`@apply` 是正確做法：

```css
@layer base {
  h1 {
    @apply text-2xl font-bold;
  }
}

/* 第三方套件：無法加 className，只能用 @apply */
@layer components {
  .prose h2 {
    @apply text-xl font-semibold mt-8;
  }
}
```
