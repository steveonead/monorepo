---
rule: query-screen-first
category: query
tags: [query, screen, container, selector]
---

# 一律用 screen.* 查詢

> 用 `screen.*` 取代 `container.querySelector`，測試才不會因 CSS class 或 DOM 結構改變而壞掉。

## 原因

- `screen` 查詢從 document 頂層出發，反映使用者實際看到的內容，而非元件內部結構。
- `container.querySelector` 依賴 CSS class 名稱或標籤結構，屬於實作細節——class 改名或 DOM 層級調整就會讓測試失敗，即使行為完全沒變。
- `screen.*` 搭配語意化查詢（role、label、text），讓錯誤訊息更清楚，易於 debug。

## ❌ Bad

```tsx
const { container } = render(<LoginForm />);
const button = container.querySelector('.submit-btn');
```

依賴 `.submit-btn` 這個 class 名稱。一旦重構樣式系統或改用 CSS Modules，測試立刻壞掉，且與元件行為無關。

## ✅ Good

```tsx
render(<LoginForm />);
const button = screen.getByRole('button', { name: /登入/i });
```

以語意角色（role）與可見文字查詢，改 class 名稱或調整 DOM 層級都不影響測試。
