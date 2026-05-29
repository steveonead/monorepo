---
rule: react19-use-transition-non-urgent
category: React 19 新 API
tags: [useTransition, concurrent, performance, react19]
---

# useTransition 標記非緊急的 component-level state 更新

> tab 切換、filter 大列表等非緊急更新用 startTransition 包裹，保持 input 流暢

## 原因

- 標記為 transition 的更新在 React 排程中優先級較低，可被緊急更新中斷
- input 輸入等高優先級更新不會被 transition 更新阻塞，UI 保持回應
- TanStack Router 已內建 navigation transition，`useTransition` 負責非 navigation 的重量級更新

## ❌ Bad

```tsx
function FilterPanel({ items }: { items: Item[] }) {
  const [filter, setFilter] = useState('')

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFilter(e.target.value) // 直接更新，大列表 filter 會讓 input 卡頓
  }

  const filtered = items.filter(i => i.name.includes(filter))

  return (
    <>
      <input value={filter} onChange={handleChange} />
      <HeavyList items={filtered} />
    </>
  )
}
```

每次 keystroke 都會同步觸發大列表重新過濾與渲染，input 明顯卡頓。

## ✅ Good

```tsx
function FilterPanel({ items }: { items: Item[] }) {
  const [filter, setFilter] = useState('')
  const [isPending, startTransition] = useTransition()

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    startTransition(() => setFilter(e.target.value)) // filter 更新標記為非緊急
  }

  const filtered = items.filter(i => i.name.includes(filter))

  return (
    <>
      <input value={filter} onChange={handleChange} />
      {isPending ? <Spinner /> : <HeavyList items={filtered} />}
    </>
  )
}
```

filter 更新被降為低優先級，React 優先處理 input 的同步更新，並透過 `isPending` 顯示過渡狀態。
