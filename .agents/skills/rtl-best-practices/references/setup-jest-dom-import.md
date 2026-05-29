---
rule: setup-jest-dom-import
category: 測試環境設定
tags: [setup, jest-dom, vitest, matcher, toBeInTheDocument]
---

# 在 setup 檔用 `/vitest` 路徑掛載 jest-dom matcher

> 在 `vitest.setup.ts` 用 `@testing-library/jest-dom/vitest` import 一次，所有測試檔案自動取得 DOM matcher。

## 原因

- 集中在 setup 檔 import，不用每個測試重複寫，減少樣板程式碼。
- vitest 環境必須用 `/vitest` 子路徑，才能正確整合 `expect` 擴充；用根路徑 `@testing-library/jest-dom` 會導致 matcher 掛載失敗或型別錯誤。
- `toBeInTheDocument()`、`toHaveTextContent()`、`toHaveValue()` 等 matcher 都依賴這個 setup 才能使用。

## ❌ Bad

```ts
// 每個測試檔案都要手動 import
import '@testing-library/jest-dom';
```

```ts
// 或 setup 檔用錯路徑
// vitest.setup.ts
import '@testing-library/jest-dom';  // vitest 環境應用 /vitest 路徑
```

根路徑 import 在 vitest 環境下無法正確擴充 `expect`，matcher 可能不存在或 TypeScript 型別報錯。分散在每個測試檔案 import 容易遺漏，導致部分測試跑出 `is not a function` 錯誤。

## ✅ Good

```ts
// vitest.setup.ts
import '@testing-library/jest-dom/vitest';
```

```ts
// vitest.config.ts 搭配設定
export default defineConfig({ // vitest.config.ts 必須使用 default export
  test: {
    setupFiles: ['./vitest.setup.ts'],
  },
});
```

`/vitest` 子路徑由 `@testing-library/jest-dom` 專門提供給 vitest，正確擴充 `expect` 並附帶完整的 TypeScript 型別定義，所有測試不需額外 import 即可直接使用 DOM matcher。
