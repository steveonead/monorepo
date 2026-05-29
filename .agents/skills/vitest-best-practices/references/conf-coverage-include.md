---
rule: conf-coverage-include
category: Config 設定
tags: [config, coverage, v8, include]
---

# 明確設定 coverage.include，搭配 v8 provider

> 設定 `coverage.provider: 'v8'` 與 `coverage.include`，確保從未被 import 的模組也出現在覆蓋率報告中。

## 原因

- Vitest v4 已移除 `coverage.all`；若不設 `coverage.include`，報告只顯示執行期間有被載入的檔案，完全未被測試 import 的模組不出現在報告裡，覆蓋率數字虛高
- `v8` 是 Vitest v4 的預設 provider，利用 V8 原生 coverage，比 istanbul 快，且不需額外 Babel 設定
- 明確的 include glob 讓報告邊界清晰，排除 test 檔、config 檔、型別宣告等不應計入的路徑

## ❌ Bad

```ts
// vitest.config.ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    coverage: {
      provider: 'istanbul',
      all: true, // v4 已移除，設定無效
      // 未設 include，只有被 import 的檔案才會出現在報告
    },
  },
})
```

`coverage.all: true` 在 v4 不再有效，報告只反映有被執行到的模組，從未被測試 import 的檔案會從報告消失。

## ✅ Good

```ts
// vitest.config.ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.d.ts',
        'src/**/*.stories.{ts,tsx}',
        'src/test/**',
      ],
    },
  },
})
```

`include` 明確涵蓋所有 `src` 下的 TypeScript 檔，即使某模組從未被任何測試 import，仍會以 0% 覆蓋率出現在報告中，讓盲點無所遁形。

## 例外

monorepo 設定可在各 package 的 `vitest.config.ts` 個別設定 `include`，指向該 package 的 `src` 路徑，避免跨 package 的路徑干擾覆蓋率統計。
