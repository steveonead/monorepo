---
rule: hooks-functional-update
category: Hooks 用法
tags: [useState, state-update, stale-closure]
---

# 更新依賴前一 state 的值要用 updater function

> 直接用 state 變數計算新值可能捕捉到 stale closure，updater function 保證拿到最新值。

## 原因

- React batches state updates，直接用 `count` 計算可能在同一 render cycle 內讀到過時的值
- updater function 的參數由 React 保證是最新的 state，不受 closure 影響
- 在 `useEffect`、事件 handler 或 `startTransition` 內尤其容易踩到 stale closure

## ❌ Bad

```tsx
function Counter() {
  const [count, setCount] = useState(0)

  function handleClick() {
    setCount(count + 1) // count 可能是 stale value
    setCount(count + 1) // 兩次呼叫只加一次
  }

  return <button onClick={handleClick}>{count}</button>
}
```

兩次 `setCount` 讀取的是同一個 closure 裡的 `count`，最終只累加一次。

## ✅ Good

```tsx
function Counter() {
  const [count, setCount] = useState(0)

  function handleClick() {
    setCount(prev => prev + 1) // 保證拿到最新值
    setCount(prev => prev + 1) // 正確累加兩次
  }

  return <button onClick={handleClick}>{count}</button>
}
```

updater function 接收 React 保證的最新值，兩次呼叫各自正確累加。
