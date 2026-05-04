# ADR 0004：api-schemas 直接暴露 `.ts` source，不產生 dist

**狀態：** 已採納

## 決策

`packages/api-schemas` 的 `package.json` exports 直接指向 `.ts` source 檔案，不執行 build 步驟、不產生 dist 產物。

## 背景

`api-schemas` 是純 Zod schema 定義，供 frontend 與 backend 共用。有兩種分發方式：

1. **Build dist**：tsc 編譯成 `.js` + `.d.ts`，exports 指向 dist。
2. **Source exports**：exports 直接指向 `.ts`，由消費端自己的 tsc 編譯。

此 package 沒有 runtime 行為，只有型別與 Zod schema，不需要獨立的 build 產物。

## 取捨

**Source exports 的優點：**

- 無需在 monorepo 中維護 build pipeline 與 dist 產物
- 消費端永遠拿到最新 source，無 stale dist 問題
- 套件設定更簡單

**Source exports 的限制：**

- 套件內部**禁用 path alias**（`@/`）。消費端的 tsc 用自己的 `tsconfig.paths` 解析，`@/` 會指向消費端 src 而非此 package，導致 TS2307。套件內部一律使用相對路徑。
- 消費端 `tsconfig` 需將此 package 的 source 納入編譯範圍。

## 影響

- `packages/api-schemas/src` 內部 import 只能用相對路徑，CI lint 應強制執行。
