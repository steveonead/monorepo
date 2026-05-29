---
rule: state-derived-from-source
category: State 管理
tags: [state, useEffect, derived-state]
---

# 衍生狀態從既有 state 計算，不用 useEffect 同步

> 能在 render 時直接算出的值不需 state，用 useEffect 同步只會製造額外的 re-render。

## 原因

- `useEffect` 同步 derived state 至少多一次 render：state 更新 → effect 觸發 → 再次更新
- 衍生值放在 state 裡容易產生 stale 問題，effect 的觸發時機不總是可預期
- 直接計算讓程式流程更線性，也是 React 官方「You Might Not Need an Effect」的核心建議

## ❌ Bad

```tsx
function FullName({ first, last }: { first: string; last: string }) {
  const [fullName, setFullName] = useState('')

  useEffect(() => {
    setFullName(`${first} ${last}`)
  }, [first, last])

  return <span>{fullName}</span>
}
```

`fullName` 在初始 render 時是空字串，effect 跑完才更新，導致不必要的閃爍與多餘渲染。

## ✅ Good

```tsx
function FullName({ first, last }: { first: string; last: string }) {
  const fullName = `${first} ${last}`
  return <span>{fullName}</span>
}
```

render 期間直接計算，單次渲染即得正確結果，程式碼更簡潔。

## 例外

衍生計算成本高（如大型清單的排序、過濾），可搭配 `useMemo` 緩存結果，但仍不需要額外的 state 與 useEffect。
