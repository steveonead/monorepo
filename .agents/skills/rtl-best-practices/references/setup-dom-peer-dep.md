---
rule: setup-dom-peer-dep
category: setup
tags: [setup, installation, peer-dependency, v16]
---

# 安裝 RTL 時明確安裝 @testing-library/dom

> RTL v16 將 `@testing-library/dom` 改為 peer dep，必須明確安裝，否則執行時功能缺失。

## 原因

- v16 breaking change：`@testing-library/dom` 從內建 dep 改為 peer dep，不再自動帶入

## ❌ Bad

```bash
npm i -D @testing-library/react
```

只裝 `@testing-library/react`，v16 不會報安裝錯誤，但執行時 query 功能缺失。

## ✅ Good

```bash
npm i -D @testing-library/react @testing-library/dom
```

TypeScript 專案另外加裝：

```bash
npm i -D @types/react @types/react-dom
```
