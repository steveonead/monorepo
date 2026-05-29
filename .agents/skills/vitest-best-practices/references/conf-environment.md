---
rule: conf-environment
category: Config 設定
tags: [config, environment, happy-dom, jsdom, node]
---

# 依測試類型選擇對應的 environment

> 元件測試用 `happy-dom`，API 或純邏輯測試用 `node`，單一 project 只設一種 environment。

## 原因

- `happy-dom` 通常比 `jsdom` 快，適合 RTL 元件測試
- `node` environment 不引入 DOM 模擬開銷，適合 supertest 或純邏輯測試
- 特殊 DOM API 不相容時（`getComputedStyle`、`ResizeObserver` 等），單檔用 per-file comment 切換，不影響整個 project

## ❌ Bad

```ts
// vitest.config.ts
export default defineConfig({
  test: {
    // 所有測試都用同一個 environment，包含 API 測試
    environment: 'jsdom',
  },
})
```

API 測試與 server-side 邏輯測試引入不必要的 DOM 模擬，執行速度下降。

## ✅ Good

```ts
// vitest.config.ts — 元件測試預設用 happy-dom
export default defineConfig({
  test: {
    environment: 'happy-dom',
  },
})
```

```ts
// 單檔切換（加在檔案最頂端）
// @vitest-environment jsdom
```

```ts
// API 測試用獨立 project
export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: 'unit',
          include: ['src/**/*.test.ts'],
          environment: 'node',
        },
      },
      {
        test: {
          name: 'component',
          include: ['src/**/*.spec.tsx'],
          environment: 'happy-dom',
        },
      },
    ],
  },
})
```

各 project 環境對應各自的測試類型，per-file comment 處理少數邊緣情況。
