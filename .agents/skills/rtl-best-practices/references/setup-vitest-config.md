---
rule: setup-vitest-config
category: 測試環境設定
tags: [setup, vitest, happy-dom, globals, cleanup]
---

# Vitest 設定須開啟 DOM 環境與 globals

> 用 `environment: 'happy-dom'`、`globals: true` 與 `setupFiles`，確保 RTL 正常運作。

## 原因

- RTL 元件測試需要 DOM 環境（`environment: 'happy-dom'`），否則無法 render 元件。
- RTL 的自動 cleanup（每次測試結束後 unmount 元件）依賴 vitest globals hook，沒開 `globals: true` 就不會自動執行。
- 未掛 `setupFiles` 導致 jest-dom matcher 缺失，每個測試都要手動 import。

## ❌ Bad

```ts
// vitest.config.ts
export default defineConfig({ // vitest.config.ts 必須使用 default export
  test: {
    environment: 'happy-dom',
    // globals 未開啟
  },
});
```

未開 `globals: true`，RTL 無法自動執行 `afterEach(cleanup)`，前一個測試 render 的 DOM 會殘留到下一個測試，造成狀態污染與難以追蹤的 flaky test。

## ✅ Good

```ts
// vitest.config.ts
export default defineConfig({ // vitest.config.ts 必須使用 default export
  test: {
    environment: 'happy-dom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
  },
});
```

`environment: 'happy-dom'` 提供 RTL render 元件所需的 DOM 環境；`globals: true` 讓 vitest 注入全域 `afterEach`，RTL 自動掛鉤其上執行 cleanup；`setupFiles` 掛載 jest-dom matchers，使 `toBeInTheDocument()` 等 matcher 全域可用。
