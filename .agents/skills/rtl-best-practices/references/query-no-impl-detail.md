---
rule: query-no-impl-detail
category: assertion
tags: [assertion, implementation-detail, state, refactoring]
---

# 只驗證使用者可見行為，不碰 state 或 props

> 測試應該在行為不變時通過、行為改變時失敗——不應隨重構而壞掉。

## 原因

- 直接存取 component 內部 state 或 instance，讓測試與實作細節耦合；只要重構 state 管理（從 `useState` 換成 `useReducer`、或拆成子元件），測試就壞掉，即使使用者根本感受不到變化。
- 使用者不在乎 `isSubmitting` 是 `true` 還是 `false`，他們在乎的是按鈕是否 disabled、spinner 是否出現。
- 測試對實作細節的耦合度越低，重構的安全網就越強。

## ❌ Bad

```tsx
// 直接存取 component 內部 state
const { result } = renderHook(() => useLoginForm());
expect(result.current.internalState.isSubmitting).toBe(true);
```

`internalState.isSubmitting` 是實作細節；把狀態搬到 Zustand 或 React Query 後，測試立刻失敗，但行為沒有任何改變。

## ✅ Good

```tsx
const user = userEvent.setup();
render(<LoginForm />);

await user.click(screen.getByRole('button', { name: /登入/i }));

// 驗證使用者可見的行為：按鈕變成 disabled
expect(screen.getByRole('button', { name: /登入/i })).toBeDisabled();
```

不管底層用什麼 state 管理，只要按鈕在 submit 中維持 disabled，測試就通過。重構 state 邏輯不會讓測試壞掉。
