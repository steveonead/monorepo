# SuperDSP monorepo

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
```

## Linting & Formatting

由 `.claude/hooks/eslint-fix.sh` PostToolUse hook 接手，每次 Write/Edit 後自動執行。**不需手動呼叫 `eslint --fix` 或 `prettier`。**
