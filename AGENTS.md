# SuperDSP monorepo

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
│   ├── frontend/          # Vite + React + TanStack Router
│   └── backend/           # NestJS + Prisma
├── packages/
│   ├── api-schemas/       # 共享 Zod schema，依領域組織
│   └── eslint-config/     # @antfu/eslint-config 封裝
├── docs/
│   └── adr/
├── tsconfig.base.json     # 所有 app 與 package 繼承的基礎設定
├── turbo.json             # Turborepo 設定檔
├── pnpm-workspace.yaml
```

## Linting & Formatting & Typecheck (Claude Code only)

- (Claude Code only) 由 PostToolUse hook 接手 Linting & Formatting，每次 Write/Edit 後自動執行。**不需手動呼叫 `eslint --fix` 或 `prettier`**
- (Claude Code only) 由 Stop hook 接手 Typecheck，每次回應結束前自動執行。有型別錯誤則 block 並顯示輸出。**不需手動呼叫 `tsc`**
