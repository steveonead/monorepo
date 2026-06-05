# 前後端共用 Zod v4 Schema

前後端同時共用的 Zod v4 schema 及其衍生 TypeScript type，依領域分組，透過 `tsdown` 編譯輸出。

## 開發與測試規範

### 開發

- 禁止任何相對路徑 import，一律使用已定義的 path alias（`@/`）。
- 一律使用 `Zod v4` 的 API 建立 schema。
- 永遠只放 `apps/` 共用的 Schema，單獨屬於各端的 Schema 邏輯禁止放入。

### 測試

- Zod 屬於 `Runtime` 的驗證，有些 rule 的變更**不影響 TypeScript 型別**（如 `.min()`、`.max()`），所以必須搭配測試覆蓋驗證行為。
- 測試檔案放在**與被測試檔案同層**的 `__test__/` 目錄下。
- 命名規則：`<filename>.test.ts`。

## 新增領域時，必須改以下一處

**`package.json` exports**

```json
{
  "./<domain>/*": {
    "import": { "types": "./dist/<domain>/*.d.mts", "default": "./dist/<domain>/*.mjs" },
    "require": { "types": "./dist/<domain>/*.d.cts", "default": "./dist/<domain>/*.cjs" }
  }
}
```
