---
rule: theme-dark-mode
category: 主題與狀態
tags: [主題與狀態, dark-mode, class-based, custom-variant]
---

# 暗色模式用 Class-Based，不用純 Media Query

> `dark:` variant 應對應 `.dark` class，讓使用者能手動覆蓋系統設定。

## 原因

- 純 `prefers-color-scheme` media query 無法讓使用者覆蓋系統設定，強制亮色或強制暗色模式做不到。
- Class-based 支援三種模式：跟隨系統、強制亮色、強制暗色，覆蓋完整用戶需求。
- v4 設定方式與 v3 不同：v3 在 JS config 加 `darkMode: 'class'`，v4 改在 CSS 檔案用 `@custom-variant`。

## ❌ Bad

```ts
// 純 media query，使用者無法手動切換主題
// Tailwind 預設的 dark: variant 對應 prefers-color-scheme
```

```tsx
<div className="bg-white dark:bg-gray-900">
  {/* 此 dark: 跟著系統設定，使用者無法覆蓋 */}
</div>
```

預設的 `dark:` 直接對應 `@media (prefers-color-scheme: dark)`，沒有辦法讓使用者手動切換。

## ✅ Good

在 CSS 進入點設定 class-based dark mode：

```css
@import "tailwindcss";

/* v4：在 CSS 內設定 dark mode 為 class-based */
@custom-variant dark (&:where(.dark, .dark *));
```

在應用程式初始化時讀取使用者偏好並套用 class：

```ts
// 讀 localStorage，fallback 到系統設定
const isDark: boolean =
  localStorage.theme === "dark" ||
  (!localStorage.theme &&
    window.matchMedia("(prefers-color-scheme: dark)").matches);

document.documentElement.classList.toggle("dark", isDark);
```

```tsx
{/* class-based：.dark class 決定主題，與 media query 無關 */}
<div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
  內容
</div>
```

`@custom-variant dark (&:where(.dark, .dark *))` 讓所有 `.dark` 後代元素都能對應 `dark:` variant，不依賴 media query。
