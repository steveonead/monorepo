---
rule: router-error-boundary
category: TanStack Router
tags: [tanstack-router, tanstack-query, errorComponent, useQueryErrorResetBoundary, error-boundary]
---

# `errorComponent` 搭配 `useQueryErrorResetBoundary` 重置 Query 錯誤狀態

> TanStack Router 的 `errorComponent` 取代 React ErrorBoundary。搭配 Query 時，必須在 `useEffect` 呼叫 `useQueryErrorResetBoundary().reset()` 重置 Query 的錯誤狀態，否則 retry 後 Query 仍停留在 error 狀態而不會重新 fetch。

## 原因

- TanStack Router 的每個 route 都可以設定 `errorComponent`，不需要手動包裹 React ErrorBoundary，邊界範圍更精確。
- Query 的錯誤狀態由 Query 內部管理，Router 的 retry（`router.invalidate()`）只重跑 loader，不會自動重置 Query 的錯誤狀態。若未呼叫 `reset()`，`useSuspenseQuery` 看到 Query 仍在 error 狀態，不會重新 fetch，errorComponent 永遠不消失。
- 設定 `defaultErrorComponent` 作為全局 fallback，確保未個別設定 `errorComponent` 的 route 也有基本的錯誤處理。

## ❌ Bad

```ts
function TodoErrorComponent({ error }: ErrorComponentProps) {
  const router = useRouter()
  return (
    <div>
      <p>{error.message}</p>
      <button onClick={() => router.invalidate()}>Retry</button>
      {/* Query 錯誤狀態未重置：retry 後 Query 不會重新 fetch */}
    </div>
  )
}
```

點擊 Retry 後 `router.invalidate()` 重跑 loader，但 Query 仍停留在 error 狀態，`useSuspenseQuery` 立即再次拋出錯誤，errorComponent 持續顯示。

## ✅ Good

```ts
import { useQueryErrorResetBoundary } from "@tanstack/react-query"
import { ErrorComponent, useRouter } from "@tanstack/react-router"
import { useEffect } from "react"

function TodoErrorComponent({ error }: ErrorComponentProps) {
  const router = useRouter()
  const queryErrorResetBoundary = useQueryErrorResetBoundary()

  useEffect(() => {
    queryErrorResetBoundary.reset() // 重置 Query 的錯誤狀態
  }, [queryErrorResetBoundary])

  return (
    <div>
      <p>{error.message}</p>
      <button onClick={() => router.invalidate()}>Retry</button>
    </div>
  )
}

// createRouter 設定全局 fallback
const router = createRouter({
  routeTree,
  context: { queryClient },
  defaultErrorComponent: GlobalErrorComponent, // 未設個別 errorComponent 的 route 使用
})
```

`useEffect` 在 errorComponent mount 時立即重置 Query 的錯誤狀態，使用者點擊 Retry 後，`router.invalidate()` 重跑 loader，Query 從乾淨狀態重新 fetch，資料就緒後 errorComponent 消失。
