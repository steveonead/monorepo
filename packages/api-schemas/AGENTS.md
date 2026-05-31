# 前後端共用 Zod v4 Schema

前後端同時共用的 Zod v4 schema 及其衍生 TypeScript type，依領域分組，透過 `tsdown` 編譯輸出。

## Import 規則

禁止相對路徑，一律使用 `@`（對應 `src/*`）。

## 限制

- **ALWAYS**使用 `v4` 的 API 建立 schema。
- **NEVER**放僅單端使用的 schema／type（放對應 app）、非 schema 邏輯（另開 package）。
- Zod runtime rule 變更（如加 `.min()`、`.max()`）**不影響 TypeScript 型別**，upstream consumer 不會在 compile time 發現異動。修改 runtime rule 時，必須搭配測試覆蓋驗證行為。

## 開發指南

### 新增領域時，必須同時改以下兩處

**1. `package.json` exports**

```json
"./<domain>/*": {
  "import": { "types": "./dist/<domain>/*.d.mts", "default": "./dist/<domain>/*.mjs" },
  "require": { "types": "./dist/<domain>/*.d.cts", "default": "./dist/<domain>/*.cjs" }
}
```

**2. 在 `package.json` scripts 確認有 `build` 指令**（`tsdown`），turbo 會自動在 typecheck 前執行。
