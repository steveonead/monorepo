---
rule: query-await-userevent
category: interaction
tags: [interaction, userEvent, async, await]
---

# 所有 user.* 呼叫一律 await

> `userEvent` 方法均回傳 Promise，漏掉 `await` 會產生難以復現的隨機測試失敗。

## 原因

- `userEvent` v14 起所有互動方法（`click`、`type`、`keyboard` 等）都是 async，沒有 `await` 等同於把互動丟進背景，後續的 assertion 可能在互動完成前就執行。
- 隨機失敗（flaky test）通常難以在 CI 復現，`await` 遺漏是最常見的根源之一。
- Vitest 和 Jest 預設不警告未被 `await` 的 Promise，靜默失敗難追蹤。

## ❌ Bad

```tsx
const user = userEvent.setup();
render(<LoginForm />);

// 遺漏 await，非同步競爭條件
user.type(screen.getByLabelText(/email/i), 'test@example.com');
user.click(screen.getByRole('button', { name: /登入/i }));

expect(screen.getByText(/歡迎/i)).toBeInTheDocument(); // 可能在互動完成前執行
```

## ✅ Good

```tsx
const user = userEvent.setup();
render(<LoginForm />);

await user.type(screen.getByLabelText(/email/i), 'test@example.com');
await user.click(screen.getByRole('button', { name: /登入/i }));

expect(screen.getByText(/歡迎/i)).toBeInTheDocument();
```

每個互動都 `await`，確保狀態已更新再進行 assertion，測試穩定可重現。
