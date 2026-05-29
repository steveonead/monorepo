# SuperDSP Monorepo

SuperDSP 2.0

## 調整 Node.js / pnpm 版本

升版時需同步更新以下四處，確保 Volta 與 nvm 用戶行為一致：

| 檔案           | 欄位             | 範例            |
| -------------- | ---------------- | --------------- |
| `package.json` | `volta.node`     | `"24.15.0"`     |
| `package.json` | `volta.pnpm`     | `"11.1.2"`      |
| `package.json` | `packageManager` | `"pnpm@11.1.2"` |
| `.nvmrc`       | （整個檔案）     | `24.15.0`       |

`engines` 欄位為寬鬆下限，不需要同步精確版號。

### 快速指令

```bash
# Volta 用戶：pin 後自動寫入 package.json
volta pin node@24.15.0
volta pin pnpm@11.1.2

# 同步更新 packageManager 欄位
corepack use pnpm@11.1.2

# 更新 .nvmrc
echo "24.15.0" > .nvmrc
```

## 版本發布流程

版本管理使用 [changelogen](https://github.com/unjs/changelogen)（Changelog 產生 + 自動版號）與 [bumpp](https://github.com/antfu/bumpp)（互動式手動發版）。

### 自動發版（CI）

每次 push 到 `main` 後，`.github/workflows/release.yml` 自動執行：

```mermaid
flowchart TD
    A[push to main] --> B{github.actor\n== github-actions bot?}
    B -- 是 --> C[跳過，防止無限迴圈]
    B -- 否 --> D[GitHub Actions 啟動]
    D --> E[changelogen --release --push]
    E --> F[依 Conventional Commits\n推算下一個版號]
    F --> G[更新 CHANGELOG.md]
    G --> H[建立 commit\nchore release vX.X.X]
    H --> I[建立 git tag]
    I --> J[push 回 main]
```

> `fetch-depth: 0` 確保 changelogen 能讀取完整 git history 以計算版號。

### 手動發版（本機）

```bash
pnpm release
```

執行 `bumpp`（讀取 `bump.config.mjs`）：

```mermaid
flowchart TD
    A[pnpm release] --> B[bumpp 互動式選擇新版號]
    B --> C[changelogen 更新 CHANGELOG.md]
    C --> D[建立 commit\nchore release vX.X.X]
    D --> E[建立 git tag]
    E --> F[⚠️ 不自動 push\npush: false]
    F --> G[手動執行\ngit push --follow-tags]
```

### 版號規則

依 [Conventional Commits](https://www.conventionalcommits.org/) 自動推算：

| Commit 類型                  | 版號變化       |
| ---------------------------- | -------------- |
| `fix:`                       | patch（0.0.x） |
| `feat:`                      | minor（0.x.0） |
| `feat!:` / `BREAKING CHANGE` | major（x.0.0） |

### 相關檔案

| 檔案                            | 用途                 |
| ------------------------------- | -------------------- |
| `.github/workflows/release.yml` | CI 自動發版 workflow |
| `bump.config.mjs`               | bumpp 手動發版設定   |
| `CHANGELOG.md`                  | 自動產生的版本紀錄   |

## pnpm 設定位置（v11+）

pnpm v11 起，設定分離至不同檔案：

| 設定類型           | 位置                                  |
| ------------------ | ------------------------------------- |
| auth / registry    | `.npmrc`                              |
| 所有其他 pnpm 設定 | `pnpm-workspace.yaml`                 |
| build script 授權  | `pnpm-workspace.yaml` → `allowBuilds` |

> **注意**：`.npmrc` 中的非 auth 設定在 v11 會被忽略。
