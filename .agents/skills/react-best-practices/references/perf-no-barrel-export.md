---
rule: perf-no-barrel-export
category: Bundle 與效能
tags: [barrel, bundle, tree-shaking, vite]
---

# 避免 barrel exports，直接 import 模組路徑

> barrel file 迫使 bundler 載入整個 module graph，拖慢 dev server 啟動與 HMR。

## 原因

- Vite 效能疑難排解文件指出 barrel file 會拖慢開發體驗，建議直接 import 模組路徑
- barrel 的 `export *` 讓 tree-shaking 難以靜態分析，打包結果包含未使用的模組
- dev server 啟動時需 transform barrel 下的所有模組，即使只用到其中一個

## ❌ Bad

```ts
// components/index.ts（barrel file）
export { Button } from './Button'
export { Input } from './Input'
export { Modal } from './Modal'
// ... 50 個元件

// 使用側：看似簡潔，實際載入整個 module graph
import { Button } from '@/components'
```

看似方便的統一入口，實際上讓 bundler 必須解析整棵 module graph 才能確定哪些模組被使用。

## ✅ Good

```ts
// 直接指向模組路徑
import { Button } from '@/components/Button'
```

直接 import 讓 bundler 只處理實際用到的模組，dev server 啟動與 HMR 速度顯著改善。

## 例外

對外公開的 library 的 public API entry point（package 的 main/exports field）仍可用 barrel，這是 library 邊界的聚合需求，非 app 內部使用。
