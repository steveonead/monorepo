---
rule: comp-prefer-children
category: 元件設計
tags: [composition, children, render-props]
---

# 優先用 children 組合，render props 只在需傳資料時使用

> children 比 render props 更可讀、更靈活，使用側不需理解 callback signature。

## 原因

- Render prop 要求使用側了解 callback 的參數與回傳型別
- `children` 可任意組合，不受 callback signature 限制
- 同一段 UI 用 children 可讀性明顯優於 render prop

## ❌ Bad

```tsx
<Composer
  renderFooter={() => (
    <>
      <Formatting />
      <Submit />
    </>
  )}
/>
```

`renderFooter` 的 callback 結構不直觀，使用側需查閱型別才能確認參數與預期回傳。

## ✅ Good

```tsx
<Composer.Frame>
  <Composer.Footer>
    <Composer.Formatting />
    <Composer.Submit />
  </Composer.Footer>
</Composer.Frame>
```

JSX 結構直接表達 UI 層級，無需了解任何 callback 約定，組合任意子元件也不需修改父層 API。

## 例外

父層需要提供資料給渲染邏輯時，render props 仍適合，如虛擬化列表的 `renderItem`。
