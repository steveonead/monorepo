---
rule: migration-act-import
category: migration
tags: [migration, act, react-dom, react19]
---

# 從正確路徑引入 `act`

> 用 `@testing-library/react` 或 `react` 引入 `act`，不用 `react-dom/test-utils`。

## 原因

- React 19 已完整移除 `react-dom/test-utils`，從舊路徑引入會在 runtime 直接拋錯，不是編譯警告
- `@testing-library/react` 的 `act` 已與 RTL render cycle 整合，搭配性最好

## ❌ Bad

```ts
import { act } from 'react-dom/test-utils';
```

React 19 執行時會拋出 `TypeError: act is not a function` 或模組找不到的錯誤。

## ✅ Good

```ts
import { act } from '@testing-library/react';
// 或
import { act } from 'react';
```

優先選 `@testing-library/react`；若在 RTL 環境外使用（如純 hook 單元測試不依賴 render），可用 `react`。
