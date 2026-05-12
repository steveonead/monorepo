# 前後端共用 Zod Schema

前後端同時共用的 Zod schema 及其衍生 TypeScript type，依領域分組，透過 `tsdown` 編譯輸出。

## 限制

**NEVER**放僅單端使用的 schema／type（放對應 app）、非 schema 邏輯（另開 package）。

## 開發指南

### 新增領域時，必須同時改以下兩處

**1. `package.json` exports**

```json
"./<domain>/*": {
  "import": { "types": "./dist/<domain>/*.d.mts", "default": "./dist/<domain>/*.mjs" },
  "require": { "types": "./dist/<domain>/*.d.cts", "default": "./dist/<domain>/*.cjs" }
}
```

**2. Build**

```bash
pnpm --filter @superdsp/api-schemas build
```
