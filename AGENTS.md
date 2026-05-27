# SuperDSP monorepo

SuperDSP 2.0 使用 turborepo 2 建立的 monorepo

## 常見指令

```bash
pnpm dev          # 啟動所有 app（turbo dev）
pnpm build        # 建置所有 app（turbo build）
pnpm lint         # lint 所有 package（turbo lint）
pnpm typecheck    # 型別檢查所有 package（turbo typecheck）
pnpm test         # 測試所有 package（turbo test）
```

## Import 規則

**禁止任何相對路徑 import，一律使用各 package 定義的 path alias。**

各 package 的 alias 對應請見各自的 `AGENTS.md`。

## 目錄結構

```
/
├── apps/
│   ├── frontend/          # Vite + React + TanStack Router + TanStack Query + shadcn/ui
│   └── backend/           # NestJS + Prisma
├── packages/
│   ├── api-schemas/       # 共享 Zod schema，依領域分組
│   └── eslint-config/     # @antfu/eslint-config 封裝
├── docs/
│   └── adr/               # 專案 ADR 文件
├── tsconfig.base.json     # 所有 app 與 package 繼承的基礎設定
├── turbo.json             # Turborepo 設定檔
├── pnpm-workspace.yaml
```
