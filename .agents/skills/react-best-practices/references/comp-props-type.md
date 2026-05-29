---
rule: comp-props-type
category: 元件設計
tags: [typescript, props, defaultProps]
---

# Props 用 type，解構設定預設值

> React 19 已移除 function component 的 defaultProps，用解構預設值取代。

## 原因

- React 19 移除 function component 的 `defaultProps`，繼續使用會觸發 runtime 警告
- 解構預設值讓元件 signature 直接呈現所有預設，不需另找 defaultProps 宣告
- `type` 支援 union 與交集，比 `interface` 更適合 Props 型別

## ❌ Bad

```tsx
interface ButtonProps {
  label: string
  disabled?: boolean
}

function Button(props: ButtonProps) {
  const disabled = props.disabled ?? false
  return <button disabled={disabled}>{props.label}</button>
}
```

使用 `interface` 且在函式內手動處理預設值，閱讀時需追蹤變數才能理解元件行為。

## ✅ Good

```tsx
type ButtonProps = {
  label: string
  disabled?: boolean
}

function Button({ label, disabled = false }: ButtonProps) {
  return <button disabled={disabled}>{label}</button>
}
```

解構預設值讓所有輸入的預設狀態一目瞭然，`type` 宣告也保留了未來擴充 union 的彈性。
