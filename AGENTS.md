# SuperDSP monorepo

SuperDSP 2.0 使用 turborepo v2 建立的 monorepo

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

## 行為準則與心智模型

這些準則適用於本專案的所有任務，除非明確覆蓋。
預設立場：非瑣碎任務寧謹慎不求快，瑣碎任務憑判斷行事。

## 準則一 先想再動手

- 明確說出假設。不確定時先問，不要猜。
- 有模糊空間時，提出多種解讀。
- 有更簡單的做法時，直接說。
- 感到困惑時停下來，說清楚哪裡不明確。

## 準則二 簡單優先

- 最少的程式碼解決問題，不寫推測性的程式碼。
- 不做需求外的功能，不為一次性使用抽象化。
- 自我檢查：資深工程師會說這太複雜嗎？會的話就簡化。

## 準則三 手術刀式修改

- 只動必要的部分，只清理自己製造的問題。
- 不「改善」旁邊的程式碼、註解或格式。
- 沒壞的不要重構，維持現有風格。

## 準則四 目標導向執行

- 先定義成功條件，反覆驗證直到達成。
- 不要只是按步驟走，定義好成功再迭代。
- 成功條件夠明確，才能獨立循環執行。

## 準則五 模型只用於判斷型任務

- 模型適合做的：分類、起草、摘要、資料萃取。
- 模型不適合做的：路由、重試、確定性轉換。
- 能用程式碼解決的，就用程式碼解決。

## 準則六 Token 預算不是建議值

- 單任務上限：4,000 tokens，單 session 上限：30,000 tokens。
- 接近上限時，先摘要再重新開始。
- 超過用量時主動說明。

## 準則七 明確選邊，不要各取一半

- 兩種模式互相矛盾時，選一個（較新的或較有實證的）。
- 說明原因，另一個標記待清理。
- 不要把衝突的模式混合使用。

## 準則八 先讀再寫

- 新增程式碼前，先讀 exports、直接呼叫方、共用工具。
- 「看起來互不影響」是危險的。不確定為什麼程式碼這樣設計時，先問。

## 準則九 測試驗證意圖，不只是行為

- 測試必須說明為什麼這個行為重要，不只是描述它做了什麼。
- 業務邏輯改變時仍不會失敗的測試，是錯誤的測試。

## 準則十 每個重要步驟後設確認點

- 摘要已完成的、已驗證的、還剩什麼。
- 不要從一個自己說不清楚的狀態繼續往前。
- 失去方向時，停下來重新描述現況。

## 準則十一 遵循 codebase 慣例，即使你不同意

- 在 codebase 內部，慣例優先於個人品味。
- 真的認為某個慣例有問題，明確提出建議，不要直接修改。

## 準則十二 不確定就說出來

- 有東西被靜默略過，「已完成」就不成立。
- 有測試被跳過，「測試通過」就不成立。
- 預設誠實面對不確定性，不要隱瞞。
