# nestjs-zod 取代 class-validator（含使用規範）

使用 nestjs-zod 搭配全域 `ZodValidationPipe` + `ZodSerializerInterceptor`，完全取代 NestJS 預設的 class-validator + class-transformer。Zod schema 已在 `api-schemas` 套件作為 API 契約，讓 backend DTO 直接繼承同一套 schema，避免重複定義並消除兩套驗證邏輯並存的風險。

**codebase 內禁止使用 class-validator / class-transformer。**

## 使用規範

**DTO 來源**

- 優先以 `createZodDto(XxxSchema)` 從 `@superdsp/api-schemas` 建立 DTO
- Server-only schema（不對外暴露的欄位）定義在各模組的 `<module>/dto/` 目錄下

**Response 序列化**

- 每個 endpoint 必須加 `@ZodSerializerDto(XxxResponseDto)` decorator，明確宣告 response contract
- 例外：回傳 `204 No Content` 或 non-JSON（檔案下載）的 endpoint

**Validation error 處理**

- `ZodValidationException` 由 custom exception filter 攔截
- 完整 Zod issues 記錄至 logger（供除錯）
- 回傳給前端統一使用 `createApiErrorSchema` 格式（`{ status: "error", message: string }`）
- 前端已用相同 Zod schema 做 client-side validation，backend 400 僅出現於邊緣情況，不對 client 揭露 field-level 細節

## 考慮過的選項

- **class-validator + class-transformer**：NestJS 預設方案，但需維護兩套 schema（Zod 用於 API 契約、class-validator 用於 backend 驗證），且 class-transformer 的執行期行為難以預測
