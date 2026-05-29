---
rule: async-waitfor-single-assertion
category: async
tags: [async, waitFor, assertion, debugging]
---

# waitFor 單一斷言

> `waitFor` callback 只放一個斷言。

## 原因

- `waitFor` 重試機制讓多斷言的失敗資訊模糊化，只會看到 timeout 而非明確失敗點
- 單一斷言讓失敗訊息精準對應問題，縮短 debug 時間

## ❌ Bad

```tsx
await waitFor(() => {
  expect(screen.getByText(/成功/i)).toBeInTheDocument();
  expect(screen.getByRole('button')).toBeDisabled();
});
```

前一個斷言通過後才執行後一個，後一個失敗只會看到 timeout，難以定位失敗點。

## ✅ Good

```tsx
await waitFor(() => expect(screen.getByText(/成功/i)).toBeInTheDocument());
await waitFor(() => expect(screen.getByRole('button')).toBeDisabled());
```

每個斷言獨立失敗，錯誤訊息直接指出問題所在。
