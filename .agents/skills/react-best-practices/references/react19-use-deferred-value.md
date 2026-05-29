---
rule: react19-use-deferred-value
category: React 19 新 API
tags: [useDeferredValue, performance, debounce, react19]
---

# useDeferredValue 延遲低優先級渲染，取代手動 debounce

> search 結果、重量級圖表等低優先級渲染用 useDeferredValue，不需手動設 debounce 時間

## 原因

- 手動 debounce 需要設固定延遲時間，無法根據裝置效能動態調整
- `useDeferredValue` 讓 React 自動調度，延遲渲染可被中斷，不會阻塞高優先級更新
- TanStack Query 管理 cache，管不到渲染優先級，兩者互補不重疊

## ❌ Bad

```tsx
function SearchResults({ query }: { query: string }) {
  // 手動 debounce：固定 300ms，裝置快時浪費，裝置慢時不夠
  const [debouncedQuery, setDebouncedQuery] = useState(query)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300)
    return () => clearTimeout(timer)
  }, [query])

  return <HeavyResultList query={debouncedQuery} />
}
```

固定 300ms 無法適應不同裝置效能，且需要額外 state 與 effect 才能管理。

## ✅ Good

```tsx
function SearchResults({ query }: { query: string }) {
  const deferredQuery = useDeferredValue(query) // React 自動調度，無固定延遲
  const isStale = query !== deferredQuery

  return (
    <div style={{ opacity: isStale ? 0.6 : 1 }}>
      <HeavyResultList query={deferredQuery} />
    </div>
  )
}
```

React 根據當前任務負載自動決定延遲時機，`isStale` 可用來顯示過渡視覺回饋，不需任何 timer。
