---
rule: mocking-cleanup-methods
category: Mock 與 Spy
tags: [mocking, clearAllMocks, resetAllMocks, restoreAllMocks, cleanup]
---

# 分清 clear / reset / restore 語意

> 三個清理方法各司其職：`clearAllMocks` 只清呼叫紀錄、`resetAllMocks` 連實作一起清掉、`restoreAllMocks` 還原 `vi.spyOn` 的原始實作。依目的選對方法，混用會殘留狀態或污染後續測試。

## 原因

- `clearAllMocks` 清掉 call count 與 results，但保留 mock 實作，跨測試重置紀錄最常用
- `resetAllMocks` 連 mock 實作一併清空，只在確實要重設行為時用
- Vitest 4 改了 `restoreAllMocks` 的行為，它只還原 `vi.spyOn` 建立的 spy，automock 不受影響（automock 的清理見 `mocking-automock-behavior`）

## ❌ Bad

```ts
const spy = vi.spyOn(obj, 'method').mockReturnValue(1)

afterEach(() => {
  // 想還原 spy 卻用 clear，原始實作沒回來，下個測試還是拿到 mock
  vi.clearAllMocks()
})
```

## ✅ Good

```ts
afterEach(() => {
  // 清掉所有 mock 的呼叫紀錄，避免 call count 跨測試殘留
  vi.clearAllMocks()
})

// 要把 vi.spyOn 還原成原始實作，明確 restore
const spy = vi.spyOn(obj, 'method').mockReturnValue(1)
// ...
spy.mockRestore()
```

`resetAllMocks` 會連實作一起清掉，只在要重設行為時用。想免去手寫 `afterEach`，改用 config 自動清理，見 `config-mock-cleanup`。
