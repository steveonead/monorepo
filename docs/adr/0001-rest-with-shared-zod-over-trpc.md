# ADR 0001：採用 REST + 共享 Zod，而非 tRPC

**狀態：** 已採納

## 決策

使用 REST API 搭配 `packages/api-schemas` 中的共享 Zod schema，不採用 tRPC。

## 背景

此架構需要 React 前端與 NestJS 後端之間的端到端型別安全。tRPC 可自動實現這一點——router 定義即是合約，無需共享套件。REST 搭配共享 Zod 同樣能達到型別安全，但需要明確維護一個共享套件。

## 取捨

tRPC 更適合 Next.js（同進程、adapter-first 設計），而非 NestJS。NestJS 的架構（guards、interceptors、pipes、decorators）是為 REST 設計的。在 NestJS 中引入 tRPC 意味著對抗框架慣例、用 tRPC middleware 取代 Pipe，並失去 NestJS 生態系工具的相容性。

`packages/api-schemas` 中的共享 Zod schema 提供同等的型別安全：前端引入 schema 用於表單驗證與型別化的 fetch，後端透過 `nestjs-zod` 使用同一份 schema 驗證請求。一個 schema 檔案，兩端皆驗證。

## 影響

`packages/api-schemas` 必須與實際 API 行為保持同步。Schema 飄移（後端修改 endpoint 結構但未更新套件）是手動紀律的問題，而非編譯期錯誤。透過 TypeScript 與 CI typecheck 來強制執行。
