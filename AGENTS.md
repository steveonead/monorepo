# SuperDSP monorepo

SuperDSP 2.0 使用 turborepo v2 建立的 monorepo

## AI 協作行為準則

- 當收到關於 Coding 任務時，**ALWAYS**閱讀 `docs/karpathy-guidelines.md`

## 常見指令

```bash
pnpm dev          # 啟動所有 app（turbo dev）
pnpm build        # 建置所有 app（turbo build）
pnpm lint         # lint 所有 package（turbo lint）
pnpm typecheck    # 型別檢查所有 package（turbo typecheck）
pnpm test         # 測試所有 package（turbo test）
```

## 目錄結構

```
/
├── apps/
│   ├── frontend/          # Vite + React + TanStack Router + TanStack Query + shadcn/ui
│   └── backend/           # NestJS + Prisma + MySQL 5.7
├── packages/
│   ├── api-schemas/       # 共享 Zod schema，依領域分組
│   └── eslint-config/     # @antfu/eslint-config 封裝
├── docs/
│   └── adr/               # 專案 ADR 文件
├── tsconfig.base.json     # 所有 app 與 package 繼承的基礎設定
├── turbo.json             # Turborepo 設定檔
├── pnpm-workspace.yaml
```

## 測試規則

- 單元測試檔案放在**與被測試檔案同層**的 `__test__/` 目錄下。
- 命名規則 packages/api-schemas 和 apps/frontend 用 `.test.ts` / `.test.tsx`。apps/backend 用 `.spec.ts`。

## 使用 es-toolkit 的 utility 函式

- 當有需要撰寫 helper 或者 utility 函式的時候，優先使用 `es-toolkit`，沒有才自己寫
