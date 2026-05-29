---
rule: rwd-mobile-first
category: RWD
tags: [rwd, mobile-first, breakpoint, responsive]
---

# Base style 是 mobile，breakpoint variant 往上疊加

> Tailwind 的 breakpoint variant 代表「從該寬度以上套用」，unprefixed class 在所有寬度生效。

## 原因

- `sm:`（≥ 640px）、`md:`（≥ 768px）等 variant 是 min-width media query，語義是往上疊加，不是往下覆蓋。
- Unprefixed class 永遠生效，不受 breakpoint 限制，因此適合作為 mobile base。
- `max-*:` variant 適合小幅例外，大型 layout 若依賴它，代表 mobile-first 思維未落實。

## ❌ Bad

```tsx
{/* 思維錯誤：把 desktop 當 base，用 max-* 往下覆蓋 */}
<div className="flex-row max-sm:flex-col gap-6 max-sm:gap-2">
  <Sidebar />
  <Main />
</div>
```

`max-sm:` 是 max-width query，這樣寫的 mental model 是 desktop-first，breakpoint 愈多愈難維護。

## ✅ Good

```tsx
{/* mobile 是 base，sm: 以上才加 row */}
<div className="flex flex-col gap-2 sm:flex-row sm:gap-6">
  <Sidebar />
  <Main />
</div>
```

從最小螢幕開始定義，breakpoint variant 只負責覆蓋更大螢幕的差異，閱讀方向和設計稿的 responsive 邏輯一致。
