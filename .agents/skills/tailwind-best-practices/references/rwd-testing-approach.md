---
rule: rwd-testing-approach
category: RWD
tags: [rwd, testing, devtools, container-query, debugging]
---

# RWD 測試要覆蓋 breakpoint 之間的寬度，container query 要確認容器的實際計算寬度

> RWD 測試只對準 breakpoint 邊界，container query 不觸發直接改 class——這兩個習慣都會漏掉真正的問題。

## 原因

- Breakpoint 邊界只是定義樣式切換點，大多數 RWD bug 出現在切換點之間。
- Container query 不觸發時，根本原因幾乎都是容器寬度不如預期，而非 class 寫錯。
- Grid 與 flex 子元素的計算寬度常受 gap 與 padding 影響，與目測值有出入。

## ❌ Bad

```tsx
// 只在精確 breakpoint 值調整視窗，漏測 641–767px 之間所有寬度
// 640px ✓  768px ✓  641px–767px ✗
page.setViewportSize({ width: 640, height: 900 });
page.setViewportSize({ width: 768, height: 900 });

// container query 不觸發 → 直接懷疑 class 寫錯，改成 viewport variant
// @md:flex-row 沒生效 → 換成 md:flex-row（往錯誤方向偵錯）
```

## ✅ Good

```tsx
// 拖動視窗從最小到最大連續掃一遍，確認 breakpoint 之間過渡正常
// 640px（sm 邊界）→ 700px（中間值）→ 768px（md 邊界）都要過

// container query 不觸發時：
// 1. DevTools → 選取 @container 元素 → Computed 面板查 width
// 2. 確認實際計算寬度是否達到 @sm（640px）或 @md（768px）門檻
// 3. 若偏窄，檢查父層 grid-cols 的 gap 或 padding 是否佔用空間
//    例：grid gap-4 在 1024px 視窗寬的三欄 grid 中，每欄實際只有 ~325px
```
