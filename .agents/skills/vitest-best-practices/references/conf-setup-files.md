---
rule: conf-setup-files
category: Config 設定
tags: [config, setupFiles, globalSetup, lifecycle]
---

# 依作用域選擇 setupFiles 或 globalSetup

> `setupFiles` 處理 per-test-file 初始化；`globalSetup` 僅用於整個 process 層級的 server 生命週期。

## 原因

- `setupFiles` 在每個 test file 執行前跑，與 test 執行在同一 process，可存取全域物件（`window`、`document`、Vitest 注入的 API），適合 RTL 的 jest-dom matchers 與 `cleanup` 設定
- `globalSetup` 整個測試 process 只執行一次，不共享 test scope，無法存取 `vi.*` 或測試全域變數，適合啟動或關閉 HTTP server
- 把 server 啟動放進 `setupFiles`，每個 test file 都會重啟 server，拖慢執行速度並可能造成 port 衝突

## ❌ Bad

```ts
// vitest.config.ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // HTTP server 放進 setupFiles，每個 test file 都會重啟
    setupFiles: ['./test/setup-server.ts'],
    // jest-dom matchers 放進 globalSetup，作用域不對，matchers 無法注入到 test context
    globalSetup: ['./test/global-setup-dom.ts'],
  },
})
```

`setupFiles` 跑 server 造成效能問題；`globalSetup` 設 jest-dom 因作用域隔離，matcher 不會被注入到 test context。

## ✅ Good

```ts
// vitest.config.ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    setupFiles: ['./test/setup-dom.ts'],    // per-test-file 初始化
    globalSetup: ['./test/global-setup.ts'], // process 層級 server 生命週期
  },
})
```

```ts
// test/setup-dom.ts — 與 test 同一 process，可存取全域
import '@testing-library/jest-dom/vitest'
```

```ts
// test/global-setup.ts — process 層級，只跑一次
import { app } from '../app'

let server: ReturnType<typeof app.listen>

export function setup() {
  server = app.listen(0)
  const address = server.address()
  if (!address || typeof address === 'string') throw new Error('Unexpected server address')
  process.env.TEST_PORT = String(address.port)
}

export function teardown() {
  server.close()
}
```

各層級各司其職，server 只啟動一次，jest-dom matchers 正確注入到每個 test file 的執行環境。
