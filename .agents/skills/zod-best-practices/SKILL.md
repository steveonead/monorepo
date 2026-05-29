---
name: zod-best-practices
description: Zod v4 最佳實踐規則集，供撰寫、審查或重構 Zod schema 相關程式碼時參考。適用於撰寫新 schema、審查 parse 邊界設計、重構 v3 遺留寫法。不適用於框架層整合（NestJS、React Hook Form 等有各自規則集）。
---

# Zod v4 Best Practices

涵蓋廢棄 API 替換、解析邊界設計、Schema 組合模式、Zod v4 新 API 採用。

## 適用時機

參考這份規則集的時機：
- 撰寫新的 Zod schema
- 將 v3 程式碼遷移至 v4
- 審查 parse 邊界與型別推斷設計
- 重構或最佳化現有 schema

## 規則分類

| 分類 | 前綴 |
|------|------|
| 廢棄 API | `deprecated-` |
| 解析邊界 | `parse-` |
| Schema 設計 | `schema-` |
| v4 新 API 採用 | `api-` |

## 規則速查

### 廢棄 API

- `deprecated-string-format` — 禁用 `.email()` / `.uuid()` 等 method 形式，改用 `z.email()` / `z.uuid()` 頂層函式
- `deprecated-error-map` — 禁用 `errorMap` 參數，改用 `error`
- `deprecated-required-error` — 禁用 `required_error` / `invalid_type_error`，改用 `error` 函式
- `deprecated-message-param` — 禁用 `{ message: '...' }` 參數，改用 `{ error: '...' }`
- `deprecated-object-methods` — 禁用 `.passthrough()` / `.strict()` / `.strip()`，改用頂層 object 函式
- `deprecated-native-enum` — 禁用 `z.nativeEnum()`，改用 `z.enum()`
- `deprecated-zod-to-json-schema` — 禁用第三方套件 `zod-to-json-schema`，改用 `z.toJSONSchema()`
- `deprecated-merge` — 禁用 `.merge()`，改用 `.extend()` 或 object spread
- `deprecated-record-single-arg` — `z.record()` 必須傳兩個參數

### 解析邊界

- `parse-safe-parse-default` — 外部輸入優先用 `safeParse()`，`parse()` 只用於失敗即是 bug 的斷言場景
- `parse-boundary-validation` — 在系統邊界驗證輸入，邊界內信任型別
- `parse-input-output-types` — 有 transform 時，輸入用 `z.input`，輸出用 `z.output`

### Schema 設計

- `schema-infer-type` — 從 schema 推斷型別，不手寫 type 再分開維護
- `schema-discriminated-union` — 多型資料用 `z.discriminatedUnion()`，不用 `z.union()`
- `schema-strict-object` — 需拒絕未知欄位的場景用 `z.strictObject()`
- `schema-recursive-getter` — 遞迴 schema 優先用 getter 語法
- `schema-super-refine` — 多個 validation error 用 `.superRefine()`，單一檢查用 `.refine()`

### v4 新 API 採用

- `api-brand` — 用 `z.brand()` 表達 nominal type
- `api-to-json-schema` — 用 `z.toJSONSchema()` 產出 JSON Schema
- `api-error-formatting` — 用 `z.prettifyError()` / `z.treeifyError()` 格式化錯誤
- `api-literal-multi-value` — 用 `z.literal()` 多值語法取代 union of literals

## 使用方式

讀取個別規則檔案以取得詳細說明與範例：

```
references/[類別前綴]-[規則名稱].md
```

每個規則檔案包含：
- 說明此規則重要的原因
- 不建議的寫法（含說明）
- 建議的寫法（含說明）
- 例外情境（如有白名單）
