---
rule: comp-single-responsibility
category: 元件設計
tags: [component, architecture, refactoring]
---

# 元件只做一件事

> 超過 300 行是分解訊號，業務邏輯應移到 custom hook。

## 原因

- 邏輯與視圖耦合時，兩者都難以獨立重用
- 混雜業務邏輯的元件測試需 mock 太多依賴
- 行數膨脹通常代表職責混雜，而非邏輯本身複雜

## ❌ Bad

元件同時負責資料取得、狀態轉換、UI 渲染與事件處理。測試任何一個環節都需要完整 render 整個元件。

## ✅ Good

業務邏輯封裝在 custom hook 中，元件只負責 JSX 結構與事件接線。

判斷標準：

- 超過 300 行 → 考慮拆分
- 多個 useEffect 分別處理不同邏輯 → 抽成 custom hook
- JSX 裡有複雜條件渲染 → 抽成子元件
