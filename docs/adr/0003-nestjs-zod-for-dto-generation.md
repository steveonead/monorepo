# ADR 0003：使用 nestjs-zod 產生 DTO

**狀態：** 已採納

## 決策

使用 `nestjs-zod` 透過 `createZodDto()` 將 `@superdsp/api-schemas` 的 Zod schema 轉換為 NestJS DTO。

## 背景

NestJS 預設的驗證方式是使用 `class-validator` + `class-transformer` 的 decorator class。這需要維護兩套平行定義：`packages/api-schemas` 中的 Zod schema（給前端用）與 `apps/backend` 中的 class-validator DTO（給 NestJS 用）。任何 API 結構異動都需同時更新兩處。

## 取捨

`nestjs-zod` 將 Zod schema 轉換為 NestJS 相容的 DTO class，讓單一 schema 同時作為前端驗證器與後端請求解析器。代價是依賴 `nestjs-zod` 這個社群套件（非 NestJS 官方）。若 `nestjs-zod` 停止維護，遷移方式是自行撰寫 `ZodValidationPipe`。

`class-validator` 更成熟且有 NestJS 官方文件支持，但需要重複定義 schema，違背了建立 `packages/api-schemas` 的初衷。

## 影響

所有 NestJS controller DTO 皆為衍生型別：`class CreateUserDto extends createZodDto(UserCreateSchema) {}`。不使用任何 `class-validator` decorator。`nestjs-zod` 提供的 `ZodValidationPipe` 全域註冊。
