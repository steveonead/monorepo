---
rule: flow-no-silent-fail
category: 控制流程
tags: [flow, error-handling, catch]
---

# 禁止靜默失敗

> 錯誤一律明確處理，空 `catch` 或只寫 `catch (e) {}` 絕對禁止。

## 原因

- 靜默吞掉例外讓系統在錯誤狀態中繼續執行，導致難以排查的後續問題
- 即使真的不需要處理，也應記錄 log 說明原因

## ❌ Bad

```ts
try {
  await saveUser(user);
} catch (e) {
  // 吞掉，什麼都不做
}
```

例外被靜默吞掉，`saveUser` 失敗時呼叫端毫無感知，後續邏輯可能基於錯誤狀態繼續執行。

## ✅ Good

```ts
try {
  await saveUser(user);
} catch (error) {
  logger.error("Failed to save user", { error, userId: user.id });
  throw error; // 或轉成業務錯誤後重新 throw
}
```

錯誤被記錄並往上傳遞，確保呼叫端或監控系統能感知問題。

## 例外

有意忽略非關鍵操作的失敗時，必須留下 log 或註解說明原因：

```ts
try {
  metrics.increment("page_view");
} catch {
  // metrics 失敗不影響主流程，但仍需記錄
  logger.warn("Metrics increment failed");
}
```
