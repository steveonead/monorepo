# Frontend

## Tech Stack

- React 19
- TypeScript 6
- Vite 8
- Zod 4
- Tailwind CSS 4 + shadcn + Base UI + hugeicons
- TanStack Router
- TanStack Query 5
- TanStack Form
- TanStack Table 8
- i18next 26
- Vitest 4

## Import 規則

禁止相對路徑，一律使用 `@`（對應 `src/*`）。

## 注意事項

- 本專案已啟用 `react compiler`，採用 **annotation mode**：需手動加 `'use memo'` directive 才會被 compiler 最佳化。
- `queryKey` 一律透過 `createQueryKeys`（`src/lib/tanstack/query-keys.ts`）產生，禁止手寫 array literal。每個 feature 的 key 定義放在 `src/features/{feature}/queries/keys.ts`。
- Mutation 的 query invalidation 採 **opt-in**：在 `useMutation` 的 `meta.invalidates` 宣告要失效的 queryKey 陣列，全域 `MutationCache` 會自動 invalidate，無需在每個 `onSuccess` 手寫。未宣告則不 invalidate 任何東西。
  ```ts
  useMutation({
    mutationFn: updateTodo,
    meta: { invalidates: [todoKeys.lists()] },
  });
  ```
  若需等 refetch 完成再繼續（例如導頁前），在 local `onSuccess` return invalidateQueries：
  ```ts
  onSuccess: () => queryClient.invalidateQueries({ queryKey: todoKeys.lists() });
  ```
