---
rule: migration-renderhook-source
category: migration
tags: [migration, renderHook, react-hooks, deprecated]
---

# 從 `@testing-library/react` 引入 `renderHook`

> 直接用 `@testing-library/react` 的 `renderHook`，不裝獨立的 `@testing-library/react-hooks` 套件。

## 原因

- `@testing-library/react-hooks` 已正式棄用，不再維護
- `@testing-library/react` v13+ 已內建 `renderHook`，安裝獨立套件只會造成版本衝突與重複依賴

## ❌ Bad

```ts
import { renderHook } from '@testing-library/react-hooks';
```

`@testing-library/react-hooks` 與 React 18+ 的 concurrent mode 不相容，可能導致測試行為不一致。

## ✅ Good

```ts
import { renderHook, act } from '@testing-library/react';

it('increments counter', () => {
  const { result } = renderHook(() => useCounter());
  act(() => result.current.increment());
  expect(result.current.count).toBe(1);
});
```

`renderHook` 與 `act` 同源，不需要跨套件協調行為，升級 React 版本時也只需要維護一個依賴。
