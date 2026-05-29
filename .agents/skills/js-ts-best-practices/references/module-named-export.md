---
rule: module-named-export
category: 模組系統
tags: [module, named-export, default-export]
---

# 優先 named export

> 模組一律用 named export，禁止 `export default`。

## 原因

- `export default` 允許呼叫端任意命名，IDE 自動 import 與全域搜尋的準確性下降
- Named export 讓重新命名時 TypeScript 的 rename symbol 工具可以全域追蹤
- Named export 在 tree-shaking 時語意更清晰

## ❌ Bad

```ts
// Button.ts
export default function Button() { /* ... */ }

// 呼叫端可任意命名，導致同一元件有多種命名
import Btn from "@/components/Button";
import MyButton from "@/components/Button";
```

同一個元件在不同檔案中出現不同名稱，搜尋與 rename 無法統一追蹤。

## ✅ Good

```ts
// Button.ts
export function Button() { /* ... */ }

// 呼叫端必須用正確名稱
import { Button } from "@/components/Button";
```

呼叫端名稱與定義端一致，TypeScript rename symbol 可全域覆蓋，搜尋結果精準。

## 例外

框架強制要求 default export 的檔案允許例外，例如 Next.js 的 `app/` 目錄頁面元件（`page.tsx`、`layout.tsx`）。
