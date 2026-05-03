# Monorepo 專案背景

## 這是什麼

全端 TypeScript monorepo。React 前端與 NestJS 後端共享 API schema。部署至 Google Cloud Run。

## 詞彙表

### App（應用程式）
`apps/` 目錄下的可部署單元。目前有兩個：`frontend` 與 `backend`。

### Package（套件）
`packages/` 目錄下的內部共享函式庫。不直接部署，由 app 引用。

### API Schema
位於 `packages/api-schemas` 的 Zod schema，定義 HTTP 請求或回應的資料結構。是唯一的真相來源——前端用於表單驗證與型別化的 fetch，後端透過 `nestjs-zod` 轉換為 NestJS DTO。

### Domain（領域）
業務功能區塊，例如 `users`、`orders`。API schema 依領域組織，而非依 HTTP method 分類。

### DTO
透過 `nestjs-zod` 的 `createZodDto(SomeSchema)` 產生的 NestJS Data Transfer Object，衍生自 API Schema，不手寫。

## 目錄結構

```
/
├── apps/
│   ├── frontend/          # Vite + React + TanStack Router
│   └── backend/           # NestJS + Prisma
├── packages/
│   ├── api-schemas/       # 共享 Zod schema，依領域組織
│   └── eslint-config/     # @antfu/eslint-config 封裝
├── docs/
│   └── adr/
├── tsconfig.base.json     # 所有 app 與 package 繼承的基礎設定
├── turbo.json
├── pnpm-workspace.yaml
└── docker-compose.yml     # 本地 MySQL（mysql:8.4）
```

## 技術選型一覽

| 關注點 | 選擇 |
|--------|------|
| 前端框架 | Vite + React + TypeScript |
| 路由 | TanStack Router（檔案式路由） |
| 樣式 | Tailwind + shadcn/ui |
| 後端框架 | NestJS + TypeScript |
| ORM | Prisma 7 |
| 資料庫 | MySQL 8.4（LTS） |
| 共享驗證 | Zod（`packages/api-schemas`） |
| NestJS 整合 Zod | `nestjs-zod` |
| 套件管理 | pnpm workspaces |
| 建置協調 | Turborepo |
| 部署 | Google Cloud Run（前後端皆容器化，前端用 nginx） |
| CI/CD | GitHub Actions + Vercel Remote Cache |
| 前端測試 | Vitest |
| 後端測試 | Jest（NestJS 預設） |
| E2E 測試 | Playwright（僅 CI，不納入 Turborepo pipeline） |
| 環境變數 | 各 app 獨立 `.env`（`apps/frontend/.env`、`apps/backend/.env`） |
| Package 命名空間 | `@superdsp/` |
| 身份驗證 | NestJS JWT（自行實作）— Access token（短效）+ Refresh token（HttpOnly cookie），rotation 與儲存策略待定 |

## Turborepo 任務

| 任務 | 有快取 | 說明 |
|------|--------|------|
| `build` | 是 | Vite 打包（前端）、tsc 輸出（後端） |
| `dev` | 否 | 本地開發伺服器 |
| `lint` | 是 | `@antfu/eslint-config` |
| `typecheck` | 是 | `tsc --noEmit`，與 build 分開執行 |
| `test` | 是 | Vitest（前端）、Jest（後端） |

`test:e2e`（Playwright）在 CI 中獨立執行，不在 Turborepo pipeline 內——因為需要執行中的伺服器。

## Docker 建置模式

兩個 app 都使用 `turbo prune` 產生最小化的 Docker context：

```bash
turbo prune <app> --docker
```

產出 `out/json`（僅套件清單）與 `out/full`（裁剪後的原始碼）。Dockerfile 使用兩階段建置：先從 `out/json` 安裝依賴，再從 `out/full` 建置。避免不相關的 app 原始碼混入映像檔。

## `packages/api-schemas` 規範

Schema 依領域組織：

```
packages/api-schemas/
├── src/
│   ├── users.ts       # UserCreateSchema、UserResponseSchema、...
│   ├── orders.ts
│   └── index.ts       # 統一重新匯出所有領域
└── package.json       # name: @superdsp/api-schemas
```

命名規則：`{Entity}{Operation}Schema`，例如 `UserCreateSchema`、`OrderResponseSchema`。
