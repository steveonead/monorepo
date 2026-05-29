---
rule: comp-no-nested-component
category: 元件設計
tags: [component, performance, eslint]
---

# 不在 render 函式內定義子元件

> render 內定義的子元件每次都產生新函式 reference，造成完整 unmount/remount。

## 原因

- 每次 render 重建函式 reference，子元件 state 被清空、effect 重跑
- unmount/remount 的表現與 key 變動相同，難以察覺根因
- 對應 @eslint-react/no-nested-component-definitions（error，無 auto-fix）

## ❌ Bad

```tsx
function Parent() {
  function Inner() {
    return <div />
  }
  return <Inner />
}
```

每次 `Parent` render 都建立新的 `Inner` 函式，React 將它視為全新元件，導致完整 unmount/remount。

## ✅ Good

```tsx
function Inner() {
  return <div />
}

function Parent() {
  return <Inner />
}
```

`Inner` 定義在模組層級，reference 穩定，React reconciler 可正確識別為同一元件。
