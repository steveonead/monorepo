---
rule: v4-mock-semantics
category: V4 API 合規
tags: [v4, mock, breaking-change, spyOn, automock, getMockName]
---

# 了解 v4 三個 mock 語義變更，避免沿用 v3 思維

> v4 調整了 `restoreAllMocks`、`getMockName` 和 automock getter 的行為，直接影響現有測試的正確性。

## 原因

- `vi.restoreAllMocks()` 現在只還原 `vi.spyOn` 建立的 spy，automock 的 call history 不受影響，v3 用法會漏清
- `getMockName()` 預設值從空字串改為 `'vi.fn()'`，含 mock name 的 snapshot 升級後全部失效
- automocked getter 預設回傳 `undefined`，不再透傳原始 getter 回傳值，依賴原始值的斷言會靜默失敗

## ❌ Bad

```ts
import { afterEach, expect, test, vi } from 'vitest'

vi.mock('./userService')

afterEach(() => {
  // v4 中 automock 的 call history 不受 restoreAllMocks 影響，仍會跨測試累積
  vi.restoreAllMocks()
})

test('calls fetchUser once', async () => {
  const { userService } = await import('./userService')
  await userService.fetchUser('123')
  expect(userService.fetchUser).toHaveBeenCalledTimes(1) // 可能誤判
})
```

```ts
// 升級 v4 後沒有重跑 --update-snapshots
// v3 snapshot 內容：MockFunction
// v4 實際輸出：MockFunction vi.fn()  ← 不吻合
expect(vi.fn()).toMatchSnapshot()
```

## ✅ Good

```ts
import { afterEach, expect, test, vi } from 'vitest'

vi.mock('./userService')

afterEach(() => {
  vi.clearAllMocks()   // 清除所有 mock 的 call history，包含 automock
  vi.restoreAllMocks() // 還原 vi.spyOn（不影響 automock）
})

test('calls fetchUser once', async () => {
  const { userService } = await import('./userService')
  await userService.fetchUser('123')
  expect(userService.fetchUser).toHaveBeenCalledTimes(1)
})
```

升級 v4 後，執行一次以更新所有含 mock name 的 snapshot：

```sh
vitest --update-snapshots
```

`vi.clearAllMocks()` 確保 automock call history 在每個 test 前歸零；`--update-snapshots` 同步新的預設 mock name。
