---
rule: query-select-stable-ref
category: tanstack-query
tags: [tanstack-query, select, useCallback, memoization, performance]
---

# `select` 函式必須有穩定的引用

> 無 deps 的 selector 放模組層級，有 deps 的用 `useCallback`，避免每次 render 建立新引用觸發不必要的重算。

## 原因

- TanStack Query 用引用相等性判斷 `select` 是否需要重算，函式引用每次 render 都改變，等於每次都強制重算，即使 data 沒有更新。
- 模組層級的函式引用天然穩定，不依賴任何 React 機制。
- 有 deps 的 selector 用 `useCallback`，只在 deps 改變時才產生新引用，避免不必要的重算。

## ❌ Bad

```ts
function TodoList({ userId }: { userId: string }) {
  const { data } = useQuery({
    ...todosQueryOptions,
    // 每次 render 都建立新的函式引用，觸發不必要的 select 重算
    select: (todos) => todos.filter((t) => t.userId === userId),
  })
}
```

`select` 是 inline arrow function，每次 render 都是全新的函式實例，即使 `userId` 和 `todos` 都沒變，TanStack Query 仍會重新執行 selector。

## ✅ Good

```ts
// 無 deps：放模組層級，引用穩定
const selectActiveTodos = (todos: Todo[]) => todos.filter((t) => !t.done)

function ActiveTodoList() {
  const { data } = useQuery({
    ...todosQueryOptions,
    select: selectActiveTodos, // 引用永遠相同，不觸發多餘重算
  })
}

// 有 deps：用 useCallback，deps 不變則引用不變
function UserTodoList({ userId }: { userId: string }) {
  const selectByUser = useCallback(
    (todos: Todo[]) => todos.filter((t) => t.userId === userId),
    [userId],
  )
  const { data } = useQuery({
    ...todosQueryOptions,
    select: selectByUser,
  })
}
```

模組層級的 selector 引用永遠穩定。有 deps 的 selector 透過 `useCallback` 控制引用更新時機，只在 `userId` 改變時才重新建立函式。

## 例外

帶有 `'use memo'` 的元件，Compiler 自動穩定函式引用，可省略 `useCallback`。
