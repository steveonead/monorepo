---
rule: module-no-barrel
category: 模組系統
tags: [module, barrel, tree-shaking]
---

# 限制 barrel export，禁 `export *`

> 預設不建立 `index.ts` barrel 檔案，`export *` 在任何場景都禁止。

## 原因

- `export *` 匯出未知數量的 symbol，讓 bundler 難以進行 tree-shaking，增加 bundle size
- Barrel 檔案在大型專案中會造成循環依賴，且讓 import 路徑模糊化
- 直接 import 具體路徑，依賴關係清楚可見

## ❌ Bad

```ts
// components/index.ts（barrel）
export * from "./Button";
export * from "./Input";
export * from "./Modal";

// 呼叫端
import { Button, Input } from "@/components"; // 不知道來自哪個檔案
```

`export *` 讓 bundler 無法靜態分析實際用到的 export，所有 symbol 都被打包進去。

## ✅ Good

```ts
// 直接 import 具體路徑
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
```

依賴關係明確，bundler 只打包實際用到的模組，tree-shaking 效果最佳。

## 例外

公開 SDK 或 library 的 entry point（`src/index.ts`）可建立 barrel，但仍禁止 `export *`，改用明確的 named re-export：

```ts
// src/index.ts（library entry point）
export { Button } from "./components/Button";
export { Input } from "./components/Input";
```
