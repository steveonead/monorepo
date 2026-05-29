---
rule: query-userevent-setup
category: query
tags: [query, userEvent, setup, interaction, v14]
---

# 用 userEvent.setup() 建立 instance，不用靜態呼叫

> `userEvent.setup()` 是 v14 正式 API，靜態呼叫（`userEvent.click()`）官方標記為 `⚠️ Avoid`。

## 原因

- `userEvent.setup()` 是 v14 正式 API，靜態呼叫官方標記為 `⚠️ Avoid`
- `setup()` 建立的 instance 保留裝置狀態，讓連續操作（按住 Shift + 點擊等）行為正確

## ❌ Bad

```tsx
await userEvent.click(screen.getByRole('button', { name: /送出/i }));
```

靜態呼叫無法保留裝置狀態，連續互動的鍵盤、指標狀態會不一致。

## ✅ Good

```tsx
const user = userEvent.setup();
render(<Form />);

await user.click(screen.getByRole('button', { name: /送出/i }));
await user.type(screen.getByLabelText(/姓名/i), 'Steve');
```

`setup()` 建立共享的 input device state，讓跨多個 `user.*` 呼叫的操作行為一致。
