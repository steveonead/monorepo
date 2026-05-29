# Best Practice Map

## 不適用

- `apps/frontend/src/components/ui` 內為 shadcn/ui 的基礎 UI，在 Code Review 時直接跳過，不作任何修改

## frontend (apps/frontend — Vite + React + TanStack Router + TanStack Query)

- **js-ts-best-practices**: TypeScript 型別定義、utility function、module 結構
- **react-best-practices**: React component、hook、context 的實作與審查
- **tailwind-best-practices**: className 撰寫、responsive 設計、設計 token 使用
- **tanstack-best-practices**: TanStack Router 路由設計、loader、search params；TanStack Query 的 query/mutation
- **zod-best-practices**: API response 型別驗證、表單 schema 定義、runtime type guard
- **vitest-best-practices**: utility function 與 custom hook 的 unit test
- **rtl-best-practices**: component 整合測試、使用者互動流程驗證

## backend (apps/backend — NestJS + Prisma)

- **js-ts-best-practices**: TypeScript 型別設計、decorator 使用、DI pattern
- **nestjs-best-practices**: module / controller / service / guard / interceptor 架構設計與審查
- **zod-best-practices**: DTO 驗證、config schema、環境變數型別安全
- **vitest-best-practices**: service unit test、helper function 測試、mock 外部依賴

## packages (packages/\*)

- **js-ts-best-practices**: 共享型別設計、monorepo 模組邊界、package exports 設定
- **zod-best-practices**: 共享 Zod schema 定義（api-schemas）、跨前後端 API contract 設計
