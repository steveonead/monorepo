---
rule: perf-use-shallow-import-path
category: 效能
tags: [performance, useShallow, import, v5]
---

# 從 `zustand/react/shallow` 引入 `useShallow`

> 元件內要做 shallow 比較，用 hook 版 `useShallow`（建議從 `zustand/react/shallow` 引入），別把純比較函式 `shallow` 當成 selector 的第二參數。

## 原因

- `useShallow` 是 React hook，用 `useRef` 快取上次回傳值，結果 shallow-equal 時沿用舊 reference
- `zustand/shallow` 主要給的是純比較函式 `shallow`（搭配 vanilla store 或 `createWithEqualityFn` 使用），v5 的 `create` 已不收第二參數，把它傳進 selector 不會生效
- 從 `zustand/react/shallow` 取用 `useShallow` 最不易混淆；真正的雷是沿用 v4 習慣，把純函式 `shallow` 當 selector 參數

## ❌ Bad

```tsx
import { useStore } from './store';
import { shallow } from 'zustand/shallow'; // 只是比較函式

function Profile() {
  // shallow 是純比較函式，在 v5 的 create 已無法傳第二參數，
  // 即使能跑也不會 memoize 這個 inline selector
  const { name, email } = useStore(
    (state) => ({ name: state.name, email: state.email }),
    shallow,
  );
  return <div>{name} / {email}</div>;
}
```

在 v5 環境內，這段甚至連型別都不會通過（`create` 不再接受 equalityFn）。

## ✅ Good

```tsx
import { useShallow } from 'zustand/react/shallow';
import { useStore } from './store';

function Profile() {
  const { name, email } = useStore(
    useShallow((state) => ({ name: state.name, email: state.email })),
  );
  return <div>{name} / {email}</div>;
}
```

`useShallow` 用 `useRef` 快取上次回傳值，結果 shallow-equal 時沿用舊 reference，達成「同樣的物件不重新觸發 re-render」的效果。是否真的需要回傳物件再包 `useShallow`，見 `perf-multiple-hooks-over-object-selector`。
