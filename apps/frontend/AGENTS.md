# Frontend

## Tech Stack

- React 19
- TypeScript 6
- Vite 8
- Zod 4
- TanStack Router
- TanStack Query 5
- Tailwind CSS 4 + shadcn + Base UI
- i18next 26
- Vitest 4

## 注意事項

- 本專案已啟用 `react compiler`，採用 **annotation mode**：需手動加 `'use memo'` directive 才會被 compiler 最佳化。
- `queryKey` 一律透過 `createQueryKeys`（`src/lib/tanstack/query-keys.ts`）產生，禁止手寫 array literal。每個 feature 的 key 定義放在 `src/features/{feature}/queries/keys.ts`。
