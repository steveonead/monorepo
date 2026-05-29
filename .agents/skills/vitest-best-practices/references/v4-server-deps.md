---
rule: v4-server-deps
category: V4 API 合規
tags: [v4, api, deps, server, breaking-change]
---

# 用 test.server.deps 取代已移除的 test.deps 子選項

> v4 移除了 `test.deps.external`、`test.deps.inline`、`test.deps.fallbackCJS`，統一改用 `test.server.deps`。

## 原因

- v4 migration guide「Deprecated APIs are Removed」明確列出這三個選項已刪除，寫了不報錯但設定不生效
- `server.deps` 語義更精準，這些是影響 SSR 端模組解析的設定，而非通用 deps 行為

## ❌ Bad

```ts
// vitest.config.ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    deps: {
      inline: ['some-esm-package'],
      external: [/node_modules/],
      fallbackCJS: true,
    },
  },
})
```

v4 中這三個選項已移除，設定靜默失效，`inline` 不會套用，可能造成 ESM 解析錯誤。

## ✅ Good

```ts
// vitest.config.ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    server: {
      deps: {
        inline: ['some-esm-package'],
        external: [/node_modules/],
        fallbackCJS: true,
      },
    },
  },
})
```

設定移至 `test.server.deps` 後，v4 正確處理模組解析。
