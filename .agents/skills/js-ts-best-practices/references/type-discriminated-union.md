---
rule: type-discriminated-union
category: 型別設計
tags: [types, discriminated-union, exhaustive-check]
---

# 用判別屬性 + exhaustive check

> 表達多種互斥狀態時，用共用 discriminator 欄位的 union type，配合 `never` 做 exhaustive check。

## 原因

- 共用 discriminator 欄位讓 TypeScript 精確收窄每個分支的型別
- `never` exhaustive check 確保新增 union 成員時編譯器強制要求補上對應處理邏輯

## ❌ Bad

```ts
type ApiState = {
  isLoading?: boolean;
  data?: User;
  error?: Error;
};

// 狀態互相交疊，無法從型別判斷目前是哪種狀態
function render(state: ApiState) {
  if (state.isLoading) return <Spinner />;
  if (state.data) return <View data={state.data} />;
}
```

狀態欄位都是 optional，三種狀態可以同時存在，型別系統無法保護每個分支的資料一定存在。

## ✅ Good

```ts
type ApiState =
  | { status: "loading" }
  | { status: "success"; data: User }
  | { status: "error"; error: Error };

function render(state: ApiState) {
  switch (state.status) {
    case "loading": return <Spinner />;
    case "success": return <View data={state.data} />;
    case "error": return <Error message={state.error.message} />;
    default:
      const _: never = state; // 有新 status 時此處報錯
      throw new Error(_);
  }
}
```

每個分支的型別由 `status` 精確收窄，`state.data` 只在 `"success"` 分支存在。`never` 確保日後新增狀態時 `switch` 必須補上對應 case。
