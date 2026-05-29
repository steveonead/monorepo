---
rule: v4-test-options-order
category: V4 API 合規
tags: [v4, api, test, describe, options]
---

# test/describe 的 options 物件放第二個參數

> v4 移除了三參數形式 `test(name, fn, options)`，options 物件必須放第二個位置。

## 原因

- v4 migration guide 明確列出 `test(name, fn, options)` 三參數形式已移除，傳入後行為未定義
- 第二位置的 options 讓參數意圖更清晰，符合「名稱 → 設定 → 實作」的閱讀順序

## ❌ Bad

```ts
import { describe, test } from 'vitest'

// options 物件放在 fn 之後，v4 不再支援
test('should retry on flaky network', async () => {
  await fetchUserData()
}, { retry: 2, timeout: 5000 })

describe('payment flow', () => {
  // ...
}, { timeout: 10000 })
```

v4 執行時這種寫法的 options 會被忽略，retry 與 timeout 設定靜默失效。

## ✅ Good

```ts
import { describe, test } from 'vitest'

// options 物件放第二個參數
test('should retry on flaky network', { retry: 2, timeout: 5000 }, async () => {
  await fetchUserData()
})

describe('payment flow', { timeout: 10000 }, () => {
  // ...
})
```

options 放第二位，v4 正確讀取 retry 與 timeout 設定。

## 例外

timeout 純數字作為最後參數仍受支援（這是另一個重載形式，非 options 物件）：

```ts
// 仍合法：數字 timeout 放最後
test('quick assertion', async () => {
  expect(1 + 1).toBe(2)
}, 1000)
```
