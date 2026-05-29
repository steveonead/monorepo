---
rule: mutation-cache-invalidation
category: mutation
tags: [mutation, invalidation, MutationCache, meta, global-callback]
---

# 用 MutationCache global callback 集中管理 invalidation

> 不在每個 `useMutation.onSettled` 個別呼叫 `invalidateQueries`，改在 `MutationCache` 的 global callback 讀取 `mutation.meta.invalidates` 統一處理。

## 原因

- 分散在各處的 `onSettled` 很難統一調整 invalidation 策略，例如加 debounce 或改條件時需要逐一修改。
- Global callback 集中維護，新增 mutation 只需要在 `meta` 宣告範圍，不必重複撰寫 invalidation 邏輯。
- 透過 TypeScript module augmentation 讓 `meta.invalidates` 有型別保護，避免拼錯屬性名稱。

## ❌ Bad

```ts
// 每個 mutation 個別管理 invalidation，散落各處難以統一調整
useMutation({
  mutationFn: createTodo,
  onSettled: () => queryClient.invalidateQueries({ queryKey: todoKeys.all }),
})

useMutation({
  mutationFn: deleteTodo,
  onSettled: () => queryClient.invalidateQueries({ queryKey: todoKeys.all }),
})
```

Invalidation 邏輯散落在每個 mutation，日後要調整（例如加 invalidation 條件或 debounce）需要逐一找出並修改。

## ✅ Good

```ts
import { MutationCache, QueryClient, QueryKey } from "@tanstack/react-query"

// 擴充 MutationMeta 型別，讓 invalidates 有型別保護
declare module "@tanstack/react-query" {
  interface Register {
    mutationMeta: {
      invalidates?: QueryKey[]
    }
  }
}

const queryClient = new QueryClient({
  mutationCache: new MutationCache({
    onSettled: (_data, _error, _variables, _context, mutation) => {
      if (mutation.meta?.invalidates) {
        // 有指定 keys：只 invalidate 指定範圍（此為社群慣例，屬性名可自訂）
        mutation.meta.invalidates.forEach((key) =>
          queryClient.invalidateQueries({ queryKey: key }),
        )
      } else {
        // 無指定：invalidate 全部作為安全預設
        queryClient.invalidateQueries()
      }
    },
  }),
})

// 使用時透過 meta 宣告 invalidation 範圍
useMutation({
  mutationFn: createTodo,
  meta: { invalidates: [todoKeys.all] },
})

useMutation({
  mutationFn: updateUserProfile,
  meta: { invalidates: [userKeys.detail(userId), todoKeys.all] },
})
```

Invalidation 邏輯集中在 `QueryClient` 初始化處，mutation 本身只宣告範圍。無 `meta.invalidates` 時 fallback 為 invalidate 全部，確保不遺漏同步。

## 例外

`meta.invalidates` 屬性名稱與「無值 fallback invalidate all」的約定是社群慣例（源自 TkDodo 部落格），並非 TanStack Query 官方文件規定，可依專案需求自訂屬性名稱或調整 fallback 行為。

有 optimistic update 的 mutation（使用 `onMutate` + snapshot + `onError` restore）應在 `onSettled` 保留 `invalidateQueries`，不透過 `meta.invalidates` 處理。
