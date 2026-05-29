---
rule: flow-lookup-table
category: 控制流程
tags: [flow, lookup, switch, record]
---

# 多條件對應改用查找表

> 輸入對應到輸出的純查表邏輯，用 `Record`、`Map` 或 `as const` 物件取代 `if-else` 或 `switch`。

## 原因

- `if-else`/`switch` 條件一增就要跟著加分支，查找表新增一行即可
- `Record<K, V>` 搭配 TypeScript 讓 key 的覆蓋由型別系統保證

## ❌ Bad

```ts
function getLabel(status: string): string {
  if (status === "active") return "啟用中";
  if (status === "inactive") return "已停用";
  if (status === "pending") return "待審核";
  return "未知";
}
```

每新增一個狀態都要新增一個 `if` 分支，`string` 型別讓 TypeScript 無法驗證 key 是否完整覆蓋。

## ✅ Good

```ts
const STATUS_LABEL: Record<"active" | "inactive" | "pending", string> = {
  active: "啟用中",
  inactive: "已停用",
  pending: "待審核",
};

function getLabel(status: keyof typeof STATUS_LABEL): string {
  return STATUS_LABEL[status];
}
```

查找表結構扁平，新增狀態只需加一行。TypeScript 透過 `Record` 型別在編譯期確保所有 key 都有對應值。
