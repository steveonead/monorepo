---
name: vitest-best-practices
description: Vitest v4 最佳實踐規則集，供撰寫、審查或重構 Vitest v4 測試程式碼時參考。適用於撰寫新測試、審查現有測試品質、從 v3 升級至 v4 的設定調整，以及 RTL / Supertest 整合的 Vitest 側設定（environment、pool、globalSetup）。RTL 查詢與互動模式見 rtl-best-practices；Supertest server 生命週期見 supertest-best-practices。
---

# Vitest v4 Best Practices

涵蓋設定、Vitest v4 API、Mock 模式、Coverage 與 Supertest 整合。

## 適用時機

參考這份規則集的時機：
- 撰寫新的 Vitest 測試
- 審查現有測試程式碼的品質
- 從 Vitest v3 升級至 v4 時的設定調整

## 規則分類

| 分類 | 前綴 |
|------|------|
| Config 設定 | `conf-` |
| V4 API | `v4-` |
| Mock 模式 | `mock-` |
| Coverage | `cov-` |
| Snapshot | `snap-` |
| Supertest 整合 | `supertest-` |

## 規則速查

### Config 設定

- `conf-separate-config` — 使用獨立的 vitest.config.ts，不合併進 vite.config.ts
- `conf-environment` — 依測試類型選擇對應的 environment（happy-dom / node）
- `conf-mock-lifecycle` — 設定 clearMocks + restoreMocks，避免 mock 狀態跨測試污染
- `conf-setup-files` — setupFiles 處理 per-test-file 初始化；globalSetup 僅用於 process 層級
- `conf-coverage-include` — 明確設定 coverage.include，搭配 v8 provider

### V4 API

- `v4-test-options-order` — test/describe 的 options 物件放第二個參數（v4 移除第三個參數形式）
- `v4-server-deps` — 禁用已移除的 test.deps.*，改用 test.server.deps
- `v4-mock-semantics` — 了解 v4 三個 mock 語義變更，避免沿用 v3 思維
- `v4-coverage-removed` — 移除 config 中已廢棄的 coverage 選項
- `v4-removed-config-keys` — 禁用 v4 已移除或棄用的 config key（poolMatchGlobs、environmentMatchGlobs、workspace）

### Mock 模式

- `mock-spyon-vs-fn` — vi.spyOn 用於需要還原的場景；vi.fn() 用於獨立 mock
- `mock-hoisting` — vi.mock() 被 hoist 至頂端，factory 內不可引用模組層變數

### Coverage

- `cov-v8-ignore` — Coverage ignore 使用 v8 語法；TypeScript 專案加 @preserve

### Snapshot

- `snap-inline-only` — 用 inline snapshot 鎖定小範圍輸出，避免大型 snapshot

### Supertest 整合

- `supertest-node-env` — Supertest 測試用 node environment；server 生命週期放 root globalSetup
- `supertest-forks-pool` — e2e 測試設 `pool: 'forks'`，防止 NestJS DI 容器跨 worker 污染

## 使用方式

讀取個別規則檔案以取得詳細說明與範例：

```
references/[類別前綴]-[規則名稱].md
```

每個規則檔案包含：
- 說明此規則重要的原因
- 不建議的寫法（含說明）
- 建議的寫法（含說明）
- 例外情境（如有白名單）
