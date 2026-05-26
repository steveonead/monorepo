---
rule: component-compiler-memo
category: 元件設計
tags: [component, performance, react-compiler, memoization]
---

# React Compiler annotation mode：用 `'use memo'` opt-in，標註後不手寫 memo

> 本專案 React Compiler 採 annotation mode（`compilationMode: 'annotation'`）：只有在 function body 頂端標 `'use memo'` 的元件或 hook 才會被 Compiler 優化，沒標的完全不動。需要 memoization 時，用 `'use memo'` 把該元件/hook opt-in，標註後就不要再手寫 `useMemo`、`useCallback`、`React.memo`，交給 Compiler 處理，只在少數 escape hatch 保留手寫（見例外）。遇到效能問題依序處理：重構 composition → React Profiler 定位 → 仍需要才用 `'use memo'` opt-in。

## 原因

- annotation mode 讓你逐個元件 opt-in，不會一次套用整個 codebase，適合漸進導入與精準控制
- 標了 `'use memo'` 的函式內，Compiler 會自動穩定 inline object / array / callback，再手寫 memo 就多餘
- 手寫 memo 的依賴容易列錯，反而失效或造成 stale closure
- 多數「re-render 太多」的真正原因是 composition 不良、狀態放錯位置，而非缺少 memo

## ❌ Bad

```tsx
// 已 opt-in 還手寫 memo，重複且依賴容易列錯
function UserCard({ user }: { user: User }) {
  'use memo';
  const fullName = useMemo(
    () => `${user.firstName} ${user.lastName}`,
    [user.firstName, user.lastName],
  );
  const handleClick = useCallback(() => console.log(user.id), [user.id]);

  return <Card onClick={handleClick}>{fullName}</Card>;
}

// 想靠手寫 React.memo 壓 re-render，但這個元件根本沒 opt-in，該做的是加 directive
const MemoCard = React.memo(UserCard);
```

## ✅ Good

```tsx
// 用 'use memo' opt-in，函式內維持樸素寫法，memoization 交給 Compiler
function UserCard({ user }: { user: User }) {
  'use memo';
  const fullName = `${user.firstName} ${user.lastName}`;
  const handleClick = () => console.log(user.id);

  return <Card onClick={handleClick}>{fullName}</Card>;
}

// custom hook 同樣用 directive opt-in
function useSortedUsers(users: User[]) {
  'use memo';
  return [...users].sort((a, b) => a.name.localeCompare(b.name));
}
```

沒標 `'use memo'` 的元件/hook，Compiler 不會碰，維持一般 React 語意。

## 效能問題的處理順序

1. **重構 composition**：把 state 往下推（抽出 stateful child），或改用 children 傳入，避免父層重 render 波及深層子樹
2. **用 React Profiler 量測**：確認到底是哪個元件、哪次 render 慢
3. **opt-in Compiler**：確認 composition 解決不了，就幫該元件/hook 加 `'use memo'` 讓 Compiler 接手，而不是手寫 memo。仍需手寫請參考下方例外

## 例外（escape hatch）

下列情境需要精確控制 referential identity，Compiler 不保證涵蓋，即使在已 opt-in 的函式內，手寫 memo 仍必要：

- **memoized 值要當 effect dependency**：官方點名的主要案例，避免值的 identity 每次變動害 effect 反覆觸發
- 與外部系統互動需要 referential equality（Map / Set 當 dependency、IntersectionObserver 的 callback）
- 三方 library 強制要求穩定 callback 識別（少數 hook、第三方 `useImperativeHandle`）時保留 `useCallback`

替已 opt-in 的函式移除既有手寫 memo，可能改變 Compiler 的編譯輸出，動既有 code 前先測過。
