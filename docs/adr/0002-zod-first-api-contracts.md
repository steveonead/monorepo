# Zod-first API 契約層（api-schemas 套件）

過去以 OpenAPI spec 作為 API 文件，但 spec 頻繁過期、與實際行為脫節。改以 `@superdsp/api-schemas` 套件的 Zod schema 作為前後端 API 契約的**唯一真實來源**，同時獲得 runtime validation 與 TypeScript 型別推斷，消除文件過期問題。

## 邊界規則

- `api-schemas` 只放前後端**共同可見**的欄位
- server-only schema 留在 backend 各自定義
- **預設 API 契約優先**：新功能先設計 Zod schema，再依此建立 Prisma schema（純 CRUD 且 DB 結構直接對應 API 時允許同時定義，但需在 PR 說明）

## 考慮過的選項

- **OpenAPI spec + code generation**：文件容易過期，code generation 增加工具鏈複雜度
- **各 app 獨立定義型別**：前後端型別漂移，無法在 compile time 發現不一致
