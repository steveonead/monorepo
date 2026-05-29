---
rule: compiler-pure-render
category: React Compiler
tags: [react-compiler, pure-function, side-effects]
---

# Render 函式必須為純函式

> 帶有 `'use memo'` 的元件，render 若含 side effects，Compiler memoization 可能導致其被跳過

## 原因

- Compiler 的 memoization 依賴 render 的 referential transparency；有 side effect 的 render 行為不可預測
- React Strict Mode 刻意執行 render 兩次，純 render 才能通過此檢測

## ❌ Bad

```tsx
function BadComponent({ value }: { value: number }) {
  "use memo"
  counterRef.current++        // render 中修改外部狀態
  return <div>{value}</div>
}
```

## ✅ Good

```tsx
function GoodComponent({ value }: { value: number }) {
  "use memo"
  useEffect(() => {
    counterRef.current++
  })
  return <div>{value}</div>
}
```
