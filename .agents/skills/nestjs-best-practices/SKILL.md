---
name: nestjs-best-practices
description: NestJS 11 + nestjs-zod 5 + Zod 4 最佳實踐規則集，供撰寫、審查或重構 NestJS 相關程式碼時參考。適用於 API 設計、模組架構、DTO 驗證、依賴注入、錯誤處理與安全設定。不適用於純 TypeScript 工具函式或前端框架層。
---

# NestJS Best Practices

涵蓋 NestJS v11 與 nestjs-zod 全域設定、DTO 設計、模組架構、依賴注入、錯誤處理、安全與效能維運。

## 適用時機

參考這份規則集的時機：
- 撰寫新的 NestJS 程式碼
- 審查現有程式碼的品質
- 重構或最佳化現有程式碼

## 規則分類

| 分類 | 前綴 |
|------|------|
| nestjs-zod 全域設定 | `setup-` |
| DTO 設計 | `dto-` |
| 模組架構 | `module-` |
| 依賴注入 | `di-` |
| 錯誤處理 | `error-` |
| 安全 | `security-` |
| 效能與維運 | `perf-` |

## 規則速查

### nestjs-zod 全域設定

- `setup-global-pipe` — 以 `APP_PIPE` token 全域註冊 `ZodValidationPipe`
- `setup-global-interceptor` — 以 `APP_INTERCEPTOR` 全域註冊 `ZodSerializerInterceptor`
- `setup-serialization-exception-filter` — 以 `APP_FILTER` 全域掛載 filter 捕捉 `ZodSerializationException`
- `setup-cleanup-openapi` — 掛載 Swagger 前呼叫 `cleanupOpenApiDoc()` 修正 OpenAPI 格式
- `setup-strict-schema-declaration` — 啟用 `strictSchemaDeclaration: true` 強制所有端點使用 Zod DTO
- `setup-zod-response` — 以 `@ZodResponse` 取代 `@ApiOkResponse` + `@ZodSerializerDto`

### DTO 設計

- `dto-create-zod-dto` — 以 `createZodDto(schema)` 取代 class-validator DTO
- `dto-compose-with-schema` — 以 `DTO.schema.omit/pick/extend` 組合 DTO，不重寫 schema
- `dto-meta-openapi-ref` — Zod v4 以 `.meta({ id: 'Name' })` 建立具名 OpenAPI `$ref`
- `dto-codec-transform` — 雙向資料轉換（如 Date ↔ ISO string）使用 codec 模式
- `dto-type-inference` — 型別宣告用 `z.infer` / `z.output`，transform 前的輸入型別用 `z.input`
- `dto-shared-package` — monorepo 中 Zod schema 放獨立 shared package，前後端共用

### 模組架構

- `module-feature-first` — 以 feature domain 為頂層組織單位，不以技術角色分層
- `module-thin-controller` — Controller 只負責接收請求、呼叫 Service、回傳 DTO
- `module-return-dto` — Service public method 回傳 DTO，不直接回傳 Entity
- `module-repository-pattern` — Service 依賴 Repository 介面，不直接呼叫 ORM
- `module-selective-export` — Module 只 export 其他 module 真正需要的項目（通常只有 Service）
- `module-shared-cross-cutting` — SharedModule 只存放真正 cross-cutting 的項目
- `module-avoid-circular-dependency` — 循環依賴優先以 EventEmitter 解耦，`forwardRef()` 是最後手段
- `module-api-versioning` — 以 `enableVersioning` + `@Controller({ version })` + `@Version()` 統一管理 API 版本
- `module-nestjs11-wildcard-route` — NestJS 11 中 `forRoutes('*')` 須改為 `forRoutes('*path')`

### 依賴注入

- `di-constructor-injection` — 偏好建構子注入，避免 property injection
- `di-provider-scope` — 預設使用 DEFAULT（singleton）scope，謹慎使用 REQUEST scope
- `di-injection-token` — 以 InjectionToken 注入介面，而非直接注入 class 實作
- `di-use-factory` — 非同步初始化的 provider 使用 `useFactory`，不在建構子內執行 side effect

### 錯誤處理

- `error-global-exception-filter` — 以 Global Exception Filter 統一錯誤回應格式
- `error-throw-not-null` — Service 層拋 NestJS HTTP Exception，不回傳 null

### 安全

- `security-jwt-default-closed` — JWT Guard 預設全局封閉，以 `@Public()` decorator 白名單開放
- `security-rate-limiting` — 以 `@nestjs/throttler` 實作 Rate Limiting

### 效能與維運

- `perf-interceptor-crosscutting` — logging、response transform、caching 放 Interceptor 處理
- `perf-config-validation` — 以 `ConfigModule.forRoot({ validate })` 在啟動時驗證環境變數

## 使用方式

讀取個別規則檔案以取得詳細說明與範例：

```
references/[類別前綴]-[規則名稱].md
```

每個規則檔案包含：
- 說明此規則重要的原因
- 不建議的寫法（含說明）
- 建議的寫法（含說明）
- 補充說明與參考
