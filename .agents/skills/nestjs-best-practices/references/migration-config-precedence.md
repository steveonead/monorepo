---
rule: migration-config-precedence
category: v10 → v11 遷移
tags: [migration, config, env]
---

# ConfigModule 讀取順序與 validatePredefined

> 升級到 `@nestjs/config@4` 後，`ignoreEnvVars` 已被 `validatePredefined` 取代；遷移時順便確認變數讀取優先序（factory > `process.env` > `.env`）是否符合預期。

## 原因

- 舊的 `ignoreEnvVars` 選項已 deprecate，繼續使用會失效且行為不明確，這是 v4 的主要變更。
- factory（`registerAs`／`load`）> `process.env` > `.env` 的讀取優先序容易被誤解，沿用舊假設可能拿到非預期的值。
- 啟動前就存在的 predefined 變數（如 `PORT=3000 node main.js`）與從 `.env` 載入的變數，驗證行為不同，需要分清楚。

## ❌ Bad

```ts
ConfigModule.forRoot({
  isGlobal: true,
  // ignoreEnvVars 在 v4 已 deprecate，無法再用來跳過 process.env 驗證
  ignoreEnvVars: true,
  validationSchema: someSchema,
});
```

沿用 `ignoreEnvVars` 不會有預期效果；若又誤以為 `.env` 會蓋過 `process.env`，拿到的設定值會出乎意料。

## ✅ Good

```ts
ConfigModule.forRoot({
  isGlobal: true,
  // 不驗證啟動前就設好的 process.env 變數時，用 validatePredefined: false
  validatePredefined: false,
  validate: (config) => envSchema.parse(config),
});
```

改用 `validatePredefined`，並確認讀取優先序（factory > `process.env` > `.env`）不影響現有設定，特別注意用 `registerAs` 定義的值會蓋過同名環境變數。

## 例外

僅維護中、尚未升級到 `@nestjs/config@4` 的專案不適用此規則。
