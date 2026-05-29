---
rule: component-static-classname
category: 組件架構
tags: [static-class, dynamic-class, purge, safelist, source-inline]
---

# class 字串必須靜態完整，不動態拼接 prefix 或 suffix

> Tailwind v4 掃描原始碼偵測 class，動態拼接的結果掃不到，CSS 永遠不會生成。

## 原因

- Tailwind 的 class 偵測基於靜態字串掃描，不執行 JavaScript。
- 動態拼接 `bg-${color}-500` 在原始碼中不存在完整的 class 字串，掃描器略過。
- 開發環境因有熱重載可能偶爾正常，生產 build 幾乎必定失效，問題難以追蹤。

## ❌ Bad

```tsx
// bg-red-500、bg-blue-500 永遠不會被生成到 CSS
const color = "red";
<div className={`bg-${color}-500`} />
```

```tsx
// 同樣的問題，只是寫法不同
const size = "lg";
<div className={`text-${size}`} />
```

動態拼接在開發環境可能偶然正常，但生產 build 後樣式消失，且錯誤沉默，難以察覺。

## ✅ Good

```tsx
// 完整 class 字串作為 map 的值，掃描器找得到
const colorMap = {
  red: "bg-red-500",
  blue: "bg-blue-500",
  green: "bg-green-500",
} as const;

type Color = keyof typeof colorMap;

function Badge({ color }: { color: Color }) {
  return <div className={colorMap[color]} />;
}
```

每個完整 class 字串都靜態存在於原始碼中，掃描器確保它們都被生成。

## 例外

確實需要動態生成 class 時，用 CSS 的 `@source inline()` 強制 safelist：

```css
/* 明確列出所有需要動態生成的 class pattern */
@source inline("{bg-red,bg-blue,bg-green}-{500,700}");
```

這個方法讓你保有動態能力，同時告訴 Tailwind 必須生成這些 class。
