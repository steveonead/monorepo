---
rule: query-userevent-over-fireevent
category: interaction
tags: [interaction, userEvent, fireEvent, events]
---

# 優先用 userEvent，不用 fireEvent

> `userEvent` 模擬完整的瀏覽器事件序列；`fireEvent` 只派送單一 DOM event，容易讓真實行為在測試中消失。

## 原因

- 使用者點擊按鈕會觸發 `pointerdown → mousedown → focus → click → pointerup → mouseup` 等一連串事件；`userEvent.click` 全部模擬，`fireEvent.click` 只送 `click`。
- 許多 UI 邏輯（tooltip 出現時機、disabled 邏輯、focus trap）依賴中間事件；`fireEvent` 測試通過不代表真實使用者不會踩到 bug。
- `userEvent.setup()` 在 v14 之後是標準用法，能共享 pointer state，讓多步驟互動更貼近真實。

## ❌ Bad

```tsx
render(<Form />);
fireEvent.click(screen.getByRole('button', { name: /提交/i }));
```

只派送 `click`，跳過所有前置事件，可能讓依賴 `mousedown` 或 `focus` 的邏輯無法被測到。

## ✅ Good

```tsx
const user = userEvent.setup();
render(<Form />);
await user.click(screen.getByRole('button', { name: /提交/i }));
```

觸發完整事件序列，測試行為與真實使用者操作一致。

## 例外

少數 `userEvent` 尚不支援的事件（如拖放、貼上特定二進位內容）才改用 `fireEvent`。
