---
rule: async-waitfor-no-sideeffect
category: 非同步處理
tags: [async, waitFor, side-effect, fireEvent]
---

# `waitFor` callback 只放斷言，不放有 side effect 的操作

> `waitFor` 會重複執行 callback 直到通過或 timeout，放在 callback 裡的 side effect 會被觸發多次。

## 原因

- `waitFor` 的重試機制設計用途是「等斷言成立」，不是「重試操作」
- side effect 被多次執行會導致難以追蹤的測試行為，例如 API 被呼叫多次、狀態疊加
- 操作與斷言分離讓測試意圖更明確

## ❌ Bad

```tsx
// fireEvent.click 在 waitFor 裡會被觸發多次
await waitFor(() => {
  fireEvent.click(screen.getByRole('button', { name: /送出/i }));
  expect(screen.getByText(/成功/i)).toBeInTheDocument();
});
```

`waitFor` 若第一次執行時斷言失敗，會重新執行整個 callback，導致 `fireEvent.click` 觸發多次。

## ✅ Good

```tsx
await user.click(screen.getByRole('button', { name: /送出/i }));
await waitFor(() => expect(screen.getByText(/成功/i)).toBeInTheDocument());
```

操作在 `waitFor` 外部執行一次，`waitFor` 只負責等待 UI 反映結果。
