---
rule: async-avoid-manual-act
category: 非同步處理
tags: [async, act, waitFor, findBy]
---

# 非同步斷言用 `findBy*` 或 `waitFor`，不手動包 `act()`

> 收到 `act()` 警告時，正確解法是改用 `waitFor` 或 `findBy*`，而非手動包 `act()`。

## 原因

- 手動 `act()` 通常是在掩蓋問題而非解決問題
- `findBy*` 語意更清晰，直接表達「等待元素非同步出現」
- `waitFor` 有 timeout 與 interval 機制，比手動 `act()` 更可靠

## ❌ Bad

```tsx
await act(async () => {
  fireEvent.click(screen.getByRole('button', { name: /送出/i }));
});
const alert = screen.getByRole('alert');
```

RTL 的 `render`、`userEvent` 已在內部包 `act`；再手動包一層只是讓非同步的狀態更新在錯誤時間 flush，無法真正等待 UI 穩定。

## ✅ Good

```tsx
await user.click(screen.getByRole('button', { name: /送出/i }));
const alert = await screen.findByRole('alert');
```

`findByRole` 底層使用 `waitFor`，會輪詢直到元素出現或 timeout，不需要額外包 `act()`。

## 例外

在純 hook 測試中包裹 state 更新，仍可合理使用 `act()`（搭配 `renderHook`）。
