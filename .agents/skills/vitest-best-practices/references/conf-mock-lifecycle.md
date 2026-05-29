---
rule: conf-mock-lifecycle
category: Config 設定
tags: [config, mock, clearMocks, restoreMocks]
---

# 設定 clearMocks 與 restoreMocks，避免 mock 狀態跨測試污染

> 在 vitest.config.ts 啟用 `clearMocks: true` 和 `restoreMocks: true`；不啟用 `resetMocks`。

## 原因

- `clearMocks` 在每次測試後清除呼叫歷史（call count、參數記錄），保留 mock implementation，讓斷言不受前一個測試干擾
- `restoreMocks` 在每次測試後將 `vi.spyOn` 還原為原始實作，防止 spy 洩漏到其他測試
- `resetMocks` 會額外重置 implementation（等同呼叫 `mockReset()`），清掉手動設定的 `mockReturnValue` / `mockImplementation`，導致需在每個 `beforeEach` 重新設定，不應預設開啟

## ❌ Bad

```ts
// vitest.config.ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // 未設定任何 mock 清理選項
  },
})
```

未設定時，`vi.spyOn` 的 call count 會跨測試累積，造成斷言結果依執行順序而異，測試結果不可信賴。

## ✅ Good

```ts
// vitest.config.ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    clearMocks: true,   // 清除呼叫歷史，保留 implementation
    restoreMocks: true, // 還原 vi.spyOn 至原始實作
  },
})
```

每次測試結束後，spy 的呼叫記錄自動清空，且 `vi.spyOn` 不會洩漏到其他測試，mock 設定只需在需要的地方宣告一次。

## 例外

若測試套件刻意在測試間共享 mock state，`clearMocks: true` 不適用。此情況改為在個別測試的 `afterEach` 中手動呼叫 `mockClear()`，而非關閉全域設定。
