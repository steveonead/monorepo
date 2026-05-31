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

## shadcn UI

- 優先使用 `shadcn` 建立 UI
- 禁止直接修改 `apps/frontend/src/components/ui` 中的基礎元件

```bash
# 一律加 -c 指定 workspace，否則 monorepo root 會報錯
# yes N：自動跳過既有檔的覆寫 prompt（-y 跳不掉），保留自訂過的 component
yes N | npx shadcn@latest add <component> -c apps/frontend
```

## React Compiler（annotation mode）

- 新增 component 或 custom hook 時，預設**不**受 React Compiler 最佳化
- 需要優化的 component/hook：在 function body **第一行**加 `"use memo"`（單/雙引號，非 backtick）
- 遇到 compiler 相容問題時：加 `"use no memo"` 並附 TODO 說明原因
- 用 React DevTools 確認是否出現 "Memo ✨" 標誌

## Query Key 工廠

- `queryKey` 一律透過 `createQueryKeys`（`src/lib/tanstack/query-keys.ts`）產生，禁止手寫 array literal。
- 每個 feature 的 key 定義放在 `src/features/{feature}/queries/keys.ts`。

## 透過 useMutation 的 `meta.invalidates` invalidate 的 queryKey 陣列

- Mutation 的 query invalidation 採 **opt-in**：在 `useMutation` 的 `meta.invalidates` invalidate queryKey 陣列，無需在每個 `onSuccess` 手寫。

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
