---
rule: conf-separate-config
category: Config 設定
tags: [config, vitest.config.ts, vite.config.ts]
---

# 使用獨立的 vitest.config.ts

> 把 Vitest 設定拆到獨立的 `vitest.config.ts`，不合併進 `vite.config.ts`。

## 原因

- CI 可用 `--config vitest.ci.config.ts` 針對性覆蓋，不影響本地開發設定
- monorepo 中各 package 可各自維護 `vitest.config.ts`，不互相干擾
- 兩個 config 各自清晰，`vite.config.ts` 不會因測試設定而膨脹

## ❌ Bad

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'happy-dom',
    setupFiles: ['./test/setup.ts'],
  },
})
```

打包設定和測試設定混在一起，CI 若要調整測試行為只能修改同一份 config。

## ✅ Good

```ts
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'happy-dom',
    setupFiles: ['./test/setup.ts'],
  },
})
```

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})
```

測試設定獨立，`vitest.config.ts` 的改動不影響打包流程。
