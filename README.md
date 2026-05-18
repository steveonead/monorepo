# SuperDSP Monorepo

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

## pnpm 設定位置（v11+）

pnpm v11 起，設定分離至不同檔案：

| 設定類型           | 位置                                  |
| ------------------ | ------------------------------------- |
| auth / registry    | `.npmrc`                              |
| 所有其他 pnpm 設定 | `pnpm-workspace.yaml`                 |
| build script 授權  | `pnpm-workspace.yaml` → `allowBuilds` |

> **注意**：`.npmrc` 中的非 auth 設定在 v11 會被忽略。
