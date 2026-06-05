# Backend

## Tech Stack

- NestJS v11 / TypeScript v6
- Prisma v6 + MySQL v5.7
- Zod v4 / nestjs-zod v5
- Vitest v4 / Supertest v7（e2e）
- date-fns v4 / es-toolkit v1

## 開發與測試規範

### 開發

- 禁止任何相對路徑 import，一律使用已定義的 path alias（`@/`）。
- 一律使用 `nestjs-zod`，禁用 `class-validator` / `class-transformer`。
- 優先用 `createZodDto(XxxSchema)` from `@superdsp/api-schemas`。server-only schema 定義在各模組的 `<module>/dto/`。
- 新功能先設計 Zod schema（api-schemas），再依此建立 Prisma schema。

### 測試

- Unit test 檔案放在**與被測試檔案同層**的 `__test__/` 目錄下，命名為 `<filename>.spec.ts`。
- E2e test 檔案放在專案根目錄的 `test/` 目錄下，命名為 `<name>.e2e-spec.ts`。
- 統一在 `vitest.config.mts` 以 `projects` 區分 unit 與 e2e：
  - 全部：`pnpm test`（`vitest run`）
  - Unit tests：`pnpm test:unit`（`--project unit`，對應 `src/**/__test__/*.spec.ts`）
  - E2e tests (in-memory module + Supertest HTTP 測試)：`pnpm test:e2e`（`--project e2e`，對應 `test/**/*.e2e-spec.ts`）
