# Frontend

## Tech Stack

- React v19 / TypeScript v6 / Vite v8 / Zod v4
- TanStack Router v1 / TanStack Query v5
- Tailwind CSS v4 / shadcn (Base UI / hugeicons)
- TanStack Form v1 / TanStack Table v8
- i18next v26 / date-fns v4 / es-toolkit v1
- Vitest v4 / Playwright v1

## 開發與測試規範

### 開發

- 禁止任何相對路徑 import，一律使用已定義的 path alias（`@/`）。

### RWD 策略

**Desktop-first**：使用 Tailwind 預設 breakpoint。

| Breakpoint | 寬度        | 支援等級 | Layout                               |
| ---------- | ----------- | -------- | ------------------------------------ |
| `xl:`      | ≥ 1280px    | 完整     | 預設目標，sidebar 固定               |
| `lg:`      | 1024–1279px | 完整     | sidebar 固定，版型略縮               |
| `md:`      | 768–1023px  | 完整     | sidebar 改 off-canvas drawer         |
| —          | < 768px     | 有限     | 單欄、隱藏次要資訊、核心功能可用即可 |

| 原則                          | 說明                                                           |
| ----------------------------- | -------------------------------------------------------------- |
| Desktop 優先                  | 複雜表格、圖表在 < 768px 幾乎無法正常使用，勿強行 mobile-first |
| 斷點切在 content 斷裂處       | 不必遷就 480/768 等整數，版面在哪裡開始擠就在那裡加            |
| Sidebar 是主要 layout concern | 以 1280px 為 overlay vs. persistent 分界，其他元件跟著走       |
| 資料元件用 Container Query    | 表格、圖表用 `@container` 自適應，不依賴全域 viewport          |

#### shadcn UI

- 優先使用 `shadcn` 建立 UI，如果找不到對應的才自己建。

```bash
# 一律加 -c 指定 workspace，否則 monorepo root 會報錯
# yes N：自動跳過既有檔的覆寫 prompt，保留自訂過的 component
yes N | npx shadcn@latest add <component> -c apps/frontend
```

#### React Compiler（annotation mode）

- 新增 component 或 custom hook 時，預設**不**受 React Compiler 最佳化
- 需要優化的 component/hook：在 function body **第一行**加 `"use memo"`（單/雙引號，非 backtick）
- 遇到 compiler 相容問題時：加 `"use no memo"` 並附 TODO 說明原因
- 用 React DevTools 確認是否出現 "Memo ✨" 標誌

#### Query Key 工廠

- `queryKey` 一律透過 `createQueryKeys`（`src/lib/tanstack/query-keys.ts`）產生，禁止手寫 array literal。
- 每個 feature 的 key 定義放在 `src/features/{feature}/queries/keys.ts`。

#### 透過 useMutation 的 `meta.invalidates` invalidate 的 queryKey 陣列

- Mutation 的 query invalidation 採 **opt-in**：在 `useMutation` 的 `meta.invalidates` invalidate queryKey 陣列，無需在每個 `onSuccess` 手寫。

```ts
useMutation({
  mutationFn: updateTodo,
  meta: { invalidates: [todoKeys.lists()] },
});

// 若需等 refetch 完成再繼續（例如導頁前），在 local `onSuccess` return invalidateQueries：
useMutation({
  mutationFn: updateTodo,
  onSuccess: () => queryClient.invalidateQueries({ queryKey: todoKeys.lists() });
});
```

## 測試

- 測試檔案放在**與被測試檔案同層**的 `__test__/` 目錄下。
- Unit test（node 環境，無 DOM）：`<filename>.test.ts`
- Integration test（happy-dom 環境，含 React render）：`<filename>.test.tsx`
