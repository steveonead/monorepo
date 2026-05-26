---
rule: store-actions-object
category: Store 設計
tags: [store, actions, structure]
---

# Action 集中在 store 的 `actions` 物件

> 所有 action 都定義在 store 的 `actions` 物件內，元件只透過 `actions` 呼叫，不直接操作 `setState`。

## 原因

- 邏輯集中在 store，可單獨測試，不會散落在各個元件 callback 內
- 元件只呼叫語意化的 action（如 `actions.addItem(item)`），不需要知道 state 結構
- `actions` 物件 reference 在整個生命週期內穩定，訂閱它不會觸發 re-render

## ❌ Bad

```tsx
import { useStore } from './store';

function Counter() {
  // 元件直接拿 setState 操作 state，邏輯外洩到 UI 層
  return (
    <button onClick={() => useStore.setState(prev => ({ count: prev.count + 1 }))}>
      +
    </button>
  );
}
```

行為邏輯散落在元件 callback，需要在多處複用同一動作時必須複製程式碼；新增 log 或條件檢查也需逐一修改各個呼叫點。

## ✅ Good

```ts
import { create } from 'zustand';

type States = {
  count: number;
};

type Actions = {
  actions: {
    inc: () => void;
    dec: () => void;
  };
};

export const useStore = create<States & Actions>()((set) => ({
  count: 0,
  actions: {
    inc: () => set((state) => ({ count: state.count + 1 })),
    dec: () => set((state) => ({ count: state.count - 1 })),
  },
}));
```

```tsx
import { useStore } from './store';

function Counter() {
  const { inc } = useStore((state) => state.actions);
  return <button onClick={inc}>+</button>;
}
```

Action 集中於 store 內維護，元件僅負責呼叫；新增上限或埋點時只需修改單一位置。

## 補充

把 action 收進 `actions` 物件是團隊採用的慣例（reference 穩定、可用單一 `useStoreActions` 取得）。官方也接受把 action 攤平在 state 頂層，不是唯一正解。React 元件外要改 state 則改用 module-level function（見 `store-module-level-actions`），那裡直接呼叫 `setState` 是正解；本規則「不直接 `setState`」針對的是元件內部。
