# Monorepo 架構（pnpm workspace + Turborepo）

Frontend 與 backend 各自定義驗證邏輯（frontend 用 Zod、backend 用 class-validator），導致驗證重複、文件過期。採用 monorepo，將 frontend、backend 與共用套件統一在同一個 repository，以 pnpm workspace 管理工作區、Turborepo 作為 task runner。

## 選擇 monorepo 的理由

- **Schema 統一**：`api-schemas` 套件與 frontend/backend 同 repo，breaking change 強制 atomic commit，消除跨 repo 型別漂移
- **AI 輔助開發**：AI 工具可同時讀取前後端 context，提升 code generation 品質
- **共用工具鏈**：eslint-config、tsconfig.base.json 統一維護，不需跨 repo 同步

## 考慮過的選項

- **Polyrepo + npm private registry 發布 api-schemas**：可共享 schema，但需額外的 registry infrastructure 與版本發布流程，overhead 不值得

## 工具選擇

- **pnpm**：
  - 團隊既有工具
  - strict node_modules（`shamefully-hoist=false`）避免幽靈依賴
  - catalog 集中管理跨 workspace 的依賴版本
- **Turborepo 而非純 pnpm workspace**：pnpm workspace 沒有 task graph 與 output cache，`api-schemas` 必須在 frontend/backend 之前 build，Turborepo 的 `dependsOn` 宣告自動處理這個順序
- **Turborepo 而非 Nx**：
  - Nx 的 code generation 與 plugin 生態對本專案規模是 overfit
  - Turborepo 的 `turbo.json` 設定直觀，上手成本低

## 後果

- `api-schemas` 為 monorepo-internal 套件，不使用 semver
- TypeScript 編譯作為契約強制執行機制：修改 schema → 所有 consumer 編譯失敗 → 強制 atomic commit 修復
- 注意：Zod runtime rule 變更（例如加 `.min()`）不影響 TypeScript 型別，需搭配測試覆蓋
