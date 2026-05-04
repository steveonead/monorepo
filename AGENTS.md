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
