---
rule: comp-no-boolean-prop-accumulation
category: 元件設計
tags: [props, api-design, readability]
---

# 用 variant 或明確子元件取代 boolean prop 堆疊

> 每增一個 boolean prop，可能狀態數量倍增，且 prop 名稱無法傳達實際渲染內容。

## 原因

- N 個 boolean prop 代表最多 2^N 種狀態組合，型別難以窮舉
- 名稱如 `isThread`、`isDMThread` 無法表達元件真正渲染什麼
- variant prop 或子元件讓使用側一眼就能理解渲染結果

## ❌ Bad

```tsx
// isThread + isEditing + isDMThread → 8 種狀態組合
<Composer isThread isEditing={false} isDMThread />
```

三個 boolean prop 組合出 8 種可能狀態，型別無法表達哪些組合有效，閱讀時需心算推導實際渲染結果。

## ✅ Good

```tsx
<Button variant="primary" size="lg" />
```

variant prop 明確列舉可能的外觀，型別即是文件。

```tsx
function ThreadComposer({ channelId }: { channelId: string }) {
  return (
    <Composer.Frame>
      <Composer.Input />
      <AlsoSendToChannelField id={channelId} />
      <Composer.Footer>
        <Composer.Submit />
      </Composer.Footer>
    </Composer.Frame>
  )
}
```

子元件名稱直接傳達結構，不需靠 boolean 組合推算。
