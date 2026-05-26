# Backend

## Tech Stack

- NestJS 11
- TypeScript 6
- Prisma 6
- Zod 4 + nestjs-zod 5
- Vitest 4 + Supertest 7（e2e）

## 注意事項

### Validation（nestjs-zod）

- **禁用** `class-validator` / `class-transformer`，codebase 內一律使用 nestjs-zod
- DTO 來源：優先用 `createZodDto(XxxSchema)` from `@superdsp/api-schemas`；server-only schema 定義在各模組的 `<module>/dto/`
- 每個 endpoint 必須加 `@ZodSerializerDto(XxxResponseDto)` decorator，明確宣告 response contract（例外：回傳 `204 No Content` 或非 JSON 的 endpoint）

### Schema 設計順序

新功能先設計 Zod schema（api-schemas），再依此建立 Prisma schema。

### Database（MySQL 5.7）

infrastructure 限制，**禁用** MySQL 8.0 專屬語法：

- Window functions
- `WITH` CTE
- `JSON_TABLE`
- `REGEXP_LIKE`

Prisma 設定使用 `engine: "classic"`。

### 測試

統一在 `vitest.config.mts` 以 `projects` 區分 unit 與 e2e：

- 全部：`pnpm test`（`vitest run`）
- Unit tests：`pnpm test:ui`（`--project unit`，對應 `src/**/*.spec.ts`）
- E2e tests：`pnpm test:e2e`（`--project e2e`，對應 `test/**/*.e2e-spec.ts`）
  - NestJS e2e 是 in-memory module + Supertest HTTP 測試，非瀏覽器 e2e
