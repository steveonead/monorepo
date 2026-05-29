---
name: rtl-best-practices
description: React Testing Library v16（搭配 Vitest 4 + React 19）的測試最佳實踐規則集，供撰寫、審查或重構 RTL 測試時參考。適用於撰寫元件測試、hook 測試、非同步斷言。不適用於 E2E 測試或單純的單元邏輯測試。
---

# React Testing Library Best Practices

涵蓋安裝設定、React Testing Library v16/React 19 API 遷移、查詢與互動、非同步斷言。

## 適用時機

參考這份規則集的時機：
- 撰寫新的 RTL 元件測試或 hook 測試
- 審查現有測試的品質
- 從舊版（RTL v13 以下、React 18 以下）遷移測試

## 規則分類

| 分類 | 前綴 |
|------|------|
| 安裝與設定 | `setup-` |
| API 遷移 | `migration-` |
| 查詢與互動 | `query-` |
| 非同步 | `async-` |

## 規則速查

### 安裝與設定

- `setup-dom-peer-dep` — RTL v16 需明確安裝 `@testing-library/dom` peer dep
- `setup-vitest-config` — Vitest 設定須開啟 `environment: 'happy-dom'` 與 `globals: true`
- `setup-jest-dom-import` — setup 檔用 `@testing-library/jest-dom/vitest` 掛載 DOM matcher

### API 遷移

- `migration-act-import` — `act` 從 `@testing-library/react` 或 `react` 引入，不從 `react-dom/test-utils`
- `migration-no-legacy-root` — `legacyRoot: true` 在 React 19 環境無法使用
- `migration-renderhook-source` — `renderHook` 直接從 `@testing-library/react` 引入，不安裝獨立套件

### 查詢與互動

- `query-priority-order` — 依官方優先序選擇 query，`getByRole` 最優先，`getByTestId` 最後手段
- `query-screen-first` — 一律用 `screen.*` 查詢，不用 `container.querySelector`
- `query-type-selection` — `getBy*`、`queryBy*`、`findBy*` 按用途嚴格對應，不混用
- `query-userevent-setup` — 用 `userEvent.setup()` 建立 instance，不用靜態呼叫
- `query-userevent-over-fireevent` — 優先用 `userEvent`，僅 `userEvent` 不支援的場景才用 `fireEvent`
- `query-await-userevent` — 所有 `user.*` 呼叫一律 `await`
- `query-no-impl-detail` — 測試只驗證使用者可見行為，不直接存取 state、instance 或 props
- `query-custom-render` — 共用 Provider 時建立 custom render helper，覆蓋並 re-export `render`

### 非同步

- `async-avoid-manual-act` — 非同步斷言用 `findBy*` 或 `waitFor`，不手動包 `act()`
- `async-waitfor-no-sideeffect` — `waitFor` callback 只放斷言，不放有 side effect 的操作
- `async-waitfor-single-assertion` — `waitFor` callback 只放一個斷言，避免 timeout 掩蓋失敗點
- `async-renderhook-scope` — `renderHook` 用於可重用 hook，應用層元件的 hook 透過元件測試覆蓋
- `async-cleanup-auto` — 開啟 `globals: true` 後無需手動呼叫 `cleanup()`

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
