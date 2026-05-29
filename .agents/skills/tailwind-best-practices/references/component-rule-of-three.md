---
rule: component-rule-of-three
category: 組件架構
tags: [component, abstraction, reuse, className, cn]
---

# 相同 class 組合出現 3+ 處才抽 React component

> 一次或兩次的重複樣式不值得抽象，過早抽象增加的複雜度比重複更貴。

## 原因

- Tailwind 官方文件建議：重複樣式用 component 或 template partial 管理，不是 `@apply`。
- 過早抽 component 會引入不必要的 props 介面，後續需求變更時反而更難改。
- 接受 `className` prop 搭配 `cn()` 是 shadcn/ui 標準模式，保留呼叫端覆蓋彈性。

## ❌ Bad

```tsx
{/* 只出現一次就抽，過早抽象 */}
function SpecialCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-white shadow-md p-6">{children}</div>
  );
}
```

這個 component 在 codebase 只用一次，抽出後讓閱讀者多一層跳轉，沒有實際收益。

## ✅ Good

```tsx
{/* 前兩次直接寫 class，第三次出現時才抽成可複用 component */}
function Card({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("rounded-xl bg-white shadow-md p-6", className)}>
      {children}
    </div>
  );
}
```

`className` prop 讓呼叫端可覆蓋或擴充樣式，不會因為 component 封裝死而需要再往下鑽。
