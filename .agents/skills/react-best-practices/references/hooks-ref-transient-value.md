---
rule: hooks-ref-transient-value
category: Hooks 用法
tags: [useRef, useEffectEvent, transient-value, stale-closure]
---

# useRef 存放不需觸發 re-render 的瞬態值

> 滾動位置、計時器 ID、「最新版 callback」等不需觸發渲染的值應放在 ref，不用 state。

## 原因

- 用 state 存瞬態值會觸發不必要的 re-render
- effect 內的 callback 容易捕捉 stale closure，ref 可保存最新版本
- React 19.2+ 提供 `useEffectEvent` 作為「最新版 callback」模式的官方解法

## ❌ Bad

```tsx
// 用 state 存計時器 ID，每次設定都觸發 re-render
function Timer() {
  const [timerId, setTimerId] = useState<ReturnType<typeof setTimeout> | null>(null)

  function start() {
    const id = setTimeout(() => console.log('done'), 1000)
    setTimerId(id)
  }

  function stop() {
    if (timerId) clearTimeout(timerId)
  }

  return (
    <>
      <button onClick={start}>Start</button>
      <button onClick={stop}>Stop</button>
    </>
  )
}
```

`timerId` 對 UI 渲染毫無意義，每次 `setTimerId` 卻強制觸發一次 re-render。

## ✅ Good（React 19.2+，useEffectEvent 穩定 API）

```tsx
// 用 useEffectEvent 直接讀取最新 callback，不需手動維護 ref
function useInterval(callback: () => void, delay: number) {
  const onTick = useEffectEvent(callback) // React 19.2+ 穩定 API

  useEffect(() => {
    const id = setInterval(onTick, delay)
    return () => clearInterval(id)
  }, [delay]) // 不需把 callback 放進 dependency array
}
```

`useEffectEvent` 封裝最新版 callback，effect 的 dependency array 不需包含它，也不會捕捉 stale closure。

## ✅ Good（React < 19.2，useRef 手動模式）

```tsx
// 手動用 ref 保存最新版 callback
function useInterval(callback: () => void, delay: number) {
  const callbackRef = useRef(callback)

  useLayoutEffect(() => {
    callbackRef.current = callback
  })

  useEffect(() => {
    const id = setInterval(() => callbackRef.current(), delay)
    return () => clearInterval(id)
  }, [delay])
}
```

`useLayoutEffect` 在每次 render 後同步更新 ref，確保 effect 內永遠呼叫到最新版 callback。

## 例外

React 19.2+ 優先用 `useEffectEvent`，上述 `useRef + useLayoutEffect` 組合保留給需相容舊版本的情境。
