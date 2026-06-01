# Backend

## Tech Stack

- NestJS v11
- TypeScript v6
- Prisma v6 + MySQL v5.7
- Zod v4 + nestjs-zod v5
- Vitest v4 + Supertest v7（e2e）

## Import 規則

- 禁止任何相對路徑 import，一律使用已定義的 path alias。

## Validation（nestjs-zod）

- **禁用** `class-validator` / `class-transformer`，codebase 內一律使用 nestjs-zod
- DTO 來源：優先用 `createZodDto(XxxSchema)` from `@superdsp/api-schemas`。server-only schema 定義在各模組的 `<module>/dto/`

## Schema 設計順序

新功能先設計 Zod schema（api-schemas），再依此建立 Prisma schema。

## 測試

統一在 `vitest.config.mts` 以 `projects` 區分 unit 與 e2e：

- 全部：`pnpm test`（`vitest run`）
- Unit tests：`pnpm test:ui`（`--project unit`，對應 `src/**/__test__/*.spec.ts`）
- E2e tests (NestJS e2e 是 in-memory module + Supertest HTTP 測試，非瀏覽器 e2e)：`pnpm test:e2e`（`--project e2e`，對應 `test/**/*.e2e-spec.ts`）
