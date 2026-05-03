# ADR 0002：NestJS 後端使用 Vitest

**狀態：** 已採納

## 決策

後端測試（`apps/backend`）改用 Vitest，與前端（`apps/frontend`）一致。Monorepo 全面採用 Vitest 作為唯一測試框架。

## 背景

NestJS 11（2026）起，官方測試 harness 預設改為 Vitest（搭配 SWC），cold start 大幅縮短，`@nestjs/testing` 與 `nest new` 產生的模板均原生支援 Vitest。

## 取捨

採用 Vitest 後 monorepo 僅維護一套測試設定，前後端 mock/spy/snapshot API 完全一致，CI 設定可共用。代價是：與舊版 Jest 教學或 Stack Overflow 答案不再對齊；少數依賴 `jest.mock` 的第三方 NestJS 套件文件需自行轉換為 `vi.mock`。透過 `unplugin-swc` 處理 NestJS decorator 的 metadata emit，避免 `reflect-metadata` 的 Vitest 隔離問題。

## 影響

`apps/backend` 透過 `vitest.config.ts` 與 `unplugin-swc` 整合 Vitest。NestJS CLI 透過 `nest g` 仍會產生 `*.spec.ts` 檔，內容直接相容 Vitest（API 相同）。Turborepo 的 `test` 任務行為不變。先前的 Jest 設定全數移除。
