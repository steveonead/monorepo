---
rule: flow-early-return
category: 控制流程
tags: [flow, early-return, nesting]
---

# 邊界條件 early return，禁深層巢狀

> 邊界條件與失敗情況先處理並 return，主邏輯維持在最外層。

## 原因

- 深層 `if-else` 巢狀讓主邏輯難以追蹤
- Early return 讓前置條件集中在開頭，主邏輯獨立在最後

## ❌ Bad

```ts
function processOrder(order: Order) {
  if (order) {
    if (order.status === "pending") {
      if (order.items.length > 0) {
        // 主邏輯在第三層
        charge(order);
        send(order);
      }
    }
  }
}
```

主邏輯被三層巢狀包裹，讀者需要一層層進入才能找到核心邏輯。

## ✅ Good

```ts
function processOrder(order: Order) {
  if (!order) return;
  if (order.status !== "pending") return;
  if (order.items.length === 0) return;

  // 主邏輯在最外層
  charge(order);
  send(order);
}
```

邊界條件集中在頂部，主邏輯無縮排干擾，易於閱讀與測試各個分支。
