---
rule: perf-virtualize-long-list
category: Bundle 與效能
tags: [virtualization, performance, dom, tanstack-virtual]
---

# 長列表用 virtualization，不一次 render 100+ DOM 節點

> 只 render 可視區域內的 item，DOM 節點數量保持固定，不隨列表長度增長。

## 原因

- 100+ DOM 節點的初始 render 和 scroll 重繪會明顯拖慢頁面
- 每個 DOM 節點都佔記憶體，長列表未虛擬化時記憶體使用量隨資料量線性增長
- Virtualization 讓 render 成本恆定，與列表總長度無關

## ❌ Bad

```tsx
// 一次 render 全部 item，列表越長越慢
type Message = { id: string; content: string }

function MessageList({ messages }: { messages: Message[] }) {
  return (
    <div className="list">
      {messages.map(msg => (
        <MessageItem key={msg.id} message={msg} />
      ))}
    </div>
  )
}
```

列表長度增長時，DOM 節點數量等比增加，初始 render 與 scroll 效能同步劣化。

## ✅ Good

```tsx
import { useRef } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'

type Message = { id: string; content: string }

function MessageList({ messages }: { messages: Message[] }) {
  const parentRef = useRef<HTMLDivElement>(null)

  const virtualizer = useVirtualizer({
    count: messages.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 60,
  })

  return (
    <div ref={parentRef} style={{ height: '600px', overflow: 'auto' }}>
      <div style={{ height: virtualizer.getTotalSize(), position: 'relative' }}>
        {virtualizer.getVirtualItems().map(virtualItem => (
          <div
            key={virtualItem.key}
            style={{
              position: 'absolute',
              top: virtualItem.start,
              width: '100%',
            }}
          >
            <MessageItem message={messages[virtualItem.index]} />
          </div>
        ))}
      </div>
    </div>
  )
}
```

無論列表有幾千筆，DOM 中只有可視區域的節點，render 與 scroll 成本恆定。

## 例外

列表不超過 50 個 item 且 item 結構簡單時，虛擬化的設定成本高於效益，可直接 render。
