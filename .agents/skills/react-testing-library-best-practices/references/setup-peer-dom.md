---
rule: setup-peer-dom
category: 安裝與環境設定
tags: [setup, dependencies, migration, v16]
---

# v16 起 @testing-library/dom 必須顯式安裝

> RTL v16 把 `@testing-library/dom` 改為 peer dependency，安裝 RTL 時要一起裝，否則 query 全失效。

## 原因

- v16 起 `@testing-library/dom` 是 peer dependency，安裝 RTL 時不會自動帶入，必須顯式安裝。
- 漏裝時 import `screen` 或 queries 會出現模組找不到，或 query 行為異常，且錯誤訊息不直觀，容易誤判成測試寫錯。

## ❌ Bad

```bash
# 沿用 v15 以前的習慣，只裝 RTL
npm install --save-dev @testing-library/react
```

少了 `@testing-library/dom`，`screen` 與所有 query 函式都無法使用。

## ✅ Good

```bash
# v16 起兩個都要裝
npm install --save-dev @testing-library/react @testing-library/dom
```

`package.json` 的 devDependencies 應同時出現兩者，`@testing-library/dom` 對應的 peer 範圍是 `^10`。

## 例外

TS 專案若會 typecheck 測試檔，還需自行安裝 `@types/react` 與 `@types/react-dom`（v16 也把它們移為 optional peer），且版本要跟 runtime 的 React 對齊。
