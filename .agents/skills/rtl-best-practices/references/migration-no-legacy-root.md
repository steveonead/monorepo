---
rule: migration-no-legacy-root
category: migration
tags: [migration, react19, legacyRoot, breaking-change]
---

# React 19 環境不可使用 legacyRoot: true

> React 19 完整移除 `ReactDOM.render`，`legacyRoot: true` 依賴此 API，傳入會在 runtime 失敗。

## 原因

- React 19 完整移除 `ReactDOM.render`，`legacyRoot` 依賴此 API
- RTL v16 搭配 React 19，`legacyRoot: true` 無任何有效使用情境

## ❌ Bad

```tsx
render(<App />, { legacyRoot: true });
```

React 19 已移除 `ReactDOM.render`，傳入此 option 會在 runtime 失敗。

## ✅ Good

```tsx
render(<App />);
```

直接使用預設 root 模式，RTL v16 搭配 React 19 的正確寫法。
