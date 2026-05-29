---
rule: component-cn-utility
category: 組件架構
tags: [cn, clsx, tailwind-merge, conditional-class, component]
---

# 條件 class 用 `cn()`，不用三元字串拼接

> `cn()` 同時處理條件合併與衝突解決，字串拼接做不到後者。

## 原因

- `tailwind-merge` 會自動解決衝突 class，例如 `p-2` 與 `p-4` 同時傳入時只保留後者。
- 字串拼接在衝突 class 並存時行為不確定，取決於 CSS specificity 與 class 順序。
- shadcn/ui 所有 component 均採用此模式，是社群標準，維護者對此有共同預期。

## ❌ Bad

```tsx
{/* 三元字串拼接，p-2 與 p-4 衝突時不會自動解決 */}
<button
  className={`px-4 py-2 ${isActive ? "bg-blue-600 text-white" : "bg-gray-100"} ${
    disabled ? "p-2 opacity-50" : "p-4"
  }`}
>
  送出
</button>
```

`p-2` 與 `px-4 py-2 p-4` 衝突，結果由 CSS 檔案內的順序決定，不受你控制。

## ✅ Good

```ts
// lib/utils.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
```

```tsx
import { cn } from "@/lib/utils";

<button
  className={cn(
    "px-4 py-2 rounded-md",
    isActive ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700",
    disabled && "opacity-50 cursor-not-allowed",
  )}
>
  送出
</button>
```

`cn()` 確保後傳入的 class 覆蓋前者，條件 class 用 `&&` 或三元表達式皆清晰可讀。
