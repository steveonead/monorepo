---
rule: config-mock-cleanup
category: 設定
tags: [config, clearMocks, restoreMocks, mockReset, cleanup]
---

# 用 config 自動清理 mock，省去 afterEach

> 在 `vitest.config.ts` 設 `clearMocks` / `restoreMocks` / `mockReset`，Vitest 會在每個測試前自動清理，不必每個檔案手寫 `afterEach`。三者的語意差異見 `mocking-cleanup-methods`。

## 原因

- `clearMocks: true` 每個測試前清掉所有 mock 的呼叫紀錄，等同自動 `clearAllMocks`
- `restoreMocks: true` 每個測試前還原所有 `vi.spyOn`，是防止 spy 洩漏到後續測試最直接的做法
- 設定一次套用全專案，比每個測試檔各自維護 `afterEach` 更不容易漏

## ❌ Bad

```ts
// 每個測試檔都重複手寫，漏一個就跨測試污染
afterEach(() => {
  vi.clearAllMocks()
  vi.restoreAllMocks()
})
```

## ✅ Good

```ts
// vitest.config.ts
export default defineConfig({
  test: {
    clearMocks: true, // 每個測試前清呼叫紀錄
    restoreMocks: true, // 每個測試前還原 vi.spyOn
  },
})
```

`mockReset: true` 會連 mock 實作一起清掉，只在要每個測試都重設行為時開。
