---
rule: compiler-annotation-opt-in
category: React Compiler
tags: [react-compiler, memoization, annotation-mode]
---

# 以 `'use memo'` opt-in React Compiler 最佳化

> 專案使用 `annotation` mode，只有第一行是 `'use memo'` 的元件/hook 才被 Compiler 編譯

## 原因

- `annotation` mode 下 Compiler 只處理明確標記的函式，其餘程式碼不受影響
- 有 `'use memo'` 的函式不需手動加 `useMemo`/`useCallback`，Compiler 自動插入

## ❌ Bad

```tsx
// 有 "use memo" 又手動加 useMemo（重複）
function HeavyList({ items }: { items: Item[] }) {
  "use memo"
  const sorted = useMemo(
    () => [...items].sort((a, b) => a.name.localeCompare(b.name)),
    [items]
  )
  return <ul>{sorted.map(i => <li key={i.id}>{i.name}</li>)}</ul>
}
```

## ✅ Good

```tsx
// 加 "use memo"，直接寫邏輯
function HeavyList({ items }: { items: Item[] }) {
  "use memo"
  const sorted = [...items].sort((a, b) => a.name.localeCompare(b.name))
  return <ul>{sorted.map(i => <li key={i.id}>{i.name}</li>)}</ul>
}

// hook 同樣適用
function useSortedData(data: Item[]) {
  "use memo"
  return data.slice().sort()
}
```

## 例外

對尚未符合 Rules of React 的元件，用 `'use no memo'` 暫時排除，並留 TODO：

```tsx
function LegacyWidget() {
  'use no memo' // TODO: migrate to controlled component (#xxx)
}
```

## 套件相容性

部分套件可能與 React Compiler 衝突，常見情況：依賴物件可變性（如直接 mutate state）、自行管理 memoization 的函式庫。

opt-in 某個元件前，先確認該元件用到的套件是否相容：

```bash
npx react-compiler-healthcheck
```

或查閱套件的 React Compiler 相容性說明與 [react.dev/learn/react-compiler](https://react.dev/learn/react-compiler) 的 Known Issues。
