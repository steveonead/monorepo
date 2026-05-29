---
rule: v4-coverage-removed
category: V4 API 合規
tags: [v4, coverage, breaking-change, v8]
---

# 移除 config 中已廢棄的 coverage 選項

> v4 移除了 `coverage.all`、`ignoreEmptyLines` 與 `experimentalAstAwareRemapping`。

## 原因

- `coverage.all` 在 v4 移除，需改用 `coverage.include` 明確指定要統計的路徑
- `ignoreEmptyLines` 的行為在 v4 成為預設，不再需要設定
- `experimentalAstAwareRemapping` 已成為唯一的 coverage 分析路徑，不再需要設定

## ❌ Bad

```ts
// vitest.config.ts（從 v3 複製過來，未清理）
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      all: true,                           // v4 已移除，改用 include
      ignoreEmptyLines: true,              // v4 行為已內建，無需設定
      experimentalAstAwareRemapping: true, // v4 已成為唯一模式，無需設定
    },
  },
})
```

v4 啟動時這三個選項靜默失效，不報錯也不生效，但會讓讀 config 的人誤以為仍有作用。

## ✅ Good

```ts
// vitest.config.ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      // ignoreEmptyLines 行為已是 v4 預設，不需要設定
      // experimentalAstAwareRemapping 已是唯一模式，不需要設定
    },
  },
})
```

config 只保留有效選項，v4 的 AST-based coverage 自動套用，不需要額外旗標。
