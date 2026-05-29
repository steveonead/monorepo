---
rule: async-cleanup-auto
category: 非同步處理
tags: [async, cleanup, vitest, globals]
---

# 開啟 Vitest `globals: true` 後無需手動呼叫 `cleanup()`

> RTL 依賴 vitest globals 偵測測試框架，開啟後自動在每個測試後執行 `cleanup`。

## 原因

- 自動 cleanup 由 RTL 偵測 vitest globals 後注冊，無需手動設定
- 手動 cleanup 在 `globals: true` 下是死代碼，增加維護負擔
- 若未開啟 globals 才需要手動 cleanup，兩者不應並存

## ❌ Bad

```ts
// vitest.setup.ts（已開啟 globals: true 的情況下）
import { cleanup } from '@testing-library/react';

afterEach(() => cleanup());  // 多餘，globals 模式已自動執行
```

手動加 `afterEach(cleanup)` 不會報錯，只是多餘的死代碼。

## ✅ Good

```ts
// vitest.config.ts
export default defineConfig({ // vitest.config.ts 必須使用 default export
  test: {
    globals: true,           // cleanup 自動執行
    environment: 'happy-dom',
    setupFiles: ['./vitest.setup.ts'],
  },
});
```

```ts
// vitest.setup.ts
import '@testing-library/jest-dom/vitest';
// 無需手動 cleanup
```

`globals: true` 讓 RTL 偵測到 vitest 環境，自動注冊 `afterEach(cleanup)`。

## 例外

不使用 `globals: true` 的專案，需在 setupFiles 手動加 `afterEach(cleanup)`。
