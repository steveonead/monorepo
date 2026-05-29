---
rule: migrate-keep-previous-data
category: migration
tags: [migration, v5, keepPreviousData, placeholderData, isPlaceholderData, pagination]
---

# `keepPreviousData` 改用 `placeholderData: keepPreviousData`

> v4 的 `keepPreviousData` 布林選項已移除，改傳入從套件 import 的 `keepPreviousData` 函式。

## 原因

- `placeholderData` 統一了「佔位資料」的概念，`keepPreviousData` 只是其中一種策略。
- 函式參數形式讓 `placeholderData` 可接受任意自訂邏輯，擴充性更高。
- 對應的狀態旗標 `isPreviousData` 重命名為 `isPlaceholderData`，語意更通用。

## ❌ Bad

```ts
const { data, isPreviousData } = useQuery({
  queryKey: ["todos", page],
  queryFn: () => fetchTodos(page),
  keepPreviousData: true, // v5 已移除
})
```

v5 中 `keepPreviousData` 不是合法選項，TypeScript 會報錯，且 `isPreviousData` 也不再存在。

## ✅ Good

```ts
import { keepPreviousData } from "@tanstack/react-query"

const { data, isPlaceholderData } = useQuery({
  queryKey: ["todos", page],
  queryFn: () => fetchTodos(page),
  placeholderData: keepPreviousData, // 傳入 import 的函式
})

// isPlaceholderData 為 true 時表示正在顯示前一頁資料
if (isPlaceholderData) return <div style={{ opacity: 0.5 }}>{renderList(data)}</div>
```

`keepPreviousData` 必須從 `@tanstack/react-query` import，不是字串常數，傳入的是函式本身。
