---
rule: migration-pool-flattened
category: Vitest 4 API 強制
tags: [migration, pool, maxWorkers, isolate, poolOptions]
---

# Pool 設定攤平為頂層選項

> v4 移除 `poolOptions`，pool 設定全部攤平為頂層選項。用 `maxWorkers` 取代 `maxThreads` / `maxForks`，用 `maxWorkers: 1, isolate: false` 取代 `singleThread` / `singleFork`。

## 原因

- v4 不再依賴 `tinypool`，`poolOptions` 整個結構失效
- thread / fork 的 worker 數量統一由 `maxWorkers` 控制，不用再分兩套
- 環境變數 `VITEST_MAX_THREADS` / `VITEST_MAX_FORKS` 一併改為 `VITEST_MAX_WORKERS`

## ❌ Bad

```ts
export default defineConfig({
  test: {
    poolOptions: {
      forks: {
        execArgv: ['--expose-gc'],
        isolate: false,
        singleFork: true,
      },
      vmThreads: {
        memoryLimit: '300Mb',
      },
    },
  },
})
```

## ✅ Good

```ts
export default defineConfig({
  test: {
    execArgv: ['--expose-gc'],
    isolate: false,
    maxWorkers: 1,
    vmMemoryLimit: '300Mb',
  },
})
```

`singleFork: true` / `singleThread: true` 的等價寫法是 `maxWorkers: 1` 搭配 `isolate: false`。
