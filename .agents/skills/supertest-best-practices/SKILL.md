---
name: supertest-best-practices
description: Supertest v7 最佳實踐規則集，供撰寫、審查或重構 NestJS 11 + Vitest 4 環境的 e2e 測試時參考。適用於撰寫新的 e2e 測試、審查 supertest 使用方式、重構現有 e2e 測試。不適用於 unit test、純 NestJS 或 Vitest 設定問題。
---

# Supertest v7 Best Practices

Vitest 4 環境下的 e2e 測試寫法：import 方式、server 生命週期管理、async 風格、斷言分工、agent 使用、請求建構、測試結構與 Cookie Assertions API。

## 適用時機

參考這份規則集的時機：
- 撰寫新的 supertest e2e 測試
- 審查現有 e2e 測試的品質
- 重構或最佳化現有 e2e 測試

## 規則分類

| 分類 | 前綴 |
|------|------|
| Import | `import-` |
| Server 生命週期 | `lifecycle-` |
| Async 風格 | `async-` |
| 斷言分工 | `assertion-` |
| Agent | `agent-` |
| 請求建構 | `request-` |
| 測試結構 | `structure-` |
| Cookie Assertions | `cookies-` |
| File Upload | `upload-` |

## 規則速查

### Import

- `import-default-import` — 用 default import，`import * as` 在啟用 `esModuleInterop` 的環境下會報錯

### Server 生命週期

- `lifecycle-use-http-server` — 傳入 `app.getHttpServer()`，不手動 `.listen()`，讓 supertest 自行管理 port 與生命週期
- `lifecycle-close-app` — 在 `afterAll` 呼叫 `await app.close()`，避免 open handles

### Async 風格

- `async-avoid-end-callback` — 不混用 `.end(callback)` 與 async/await，callback 路徑的錯誤無法被外層函式捕捉
- `async-await-chain` — 測試函式必須 `await` 或 `return` supertest chain，floating promise 斷言失敗不報錯

### 斷言分工

- `assertion-http-vs-payload` — HTTP 合約（status、header）用 supertest `.expect()`，payload 結構用 vitest `expect()`
- `assertion-simple-expect` — `.expect(status, body)` 只用於精確比對，有動態欄位時分開寫
- `assertion-no-spy-in-e2e` — e2e 測試只驗證 HTTP 行為，不用 `vi.spyOn` 驗實作細節

### Agent

- `agent-persistent-cookie` — 跨請求維持 session 用 `request.agent()`，不手動帶 cookie header
- `agent-isolate-per-describe` — 每個 describe 各自建立新 agent，不跨 describe 共用

### 請求建構

- `request-send-json` — JSON body 用 `.send(object)`，Content-Type 自動設定
- `request-accept-header` — 測試 JSON endpoint 時建議設定 `.set('Accept', 'application/json')`

### 測試結構

- `structure-factory-in-beforeall` — app 初始化抽成 factory function，在 `beforeAll` 呼叫
- `structure-replicate-global-setup` — Global pipes/filters/interceptors 不從 `main.ts` 繼承，測試 factory 須手動套用
- `structure-cleanup-timing` — 資料清理放在 `beforeEach`，不在 `afterAll`

### Cookie Assertions

- `cookies-v720-assertions` — v7.2.0+ 用 `request.cookies` API 斷言 cookie，不手動解析 `set-cookie` header
- `cookies-upgrade-types` — 使用 cookies API 時，將 `@types/supertest` 升至 `^7.2`

### File Upload

- `upload-multipart` — multipart 上傳用 `.field()` + `.attach()`，不混用 `.send()`，不手動設 `Content-Type`

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
