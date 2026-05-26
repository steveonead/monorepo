---
rule: v5-stable-selector-output
category: v5 升級
tags: [v5, migration, selector, infinite-loop]
---

# Selector 必須回傳 stable reference

> selector 每次回傳新建立的物件或陣列，v5 會視為值改變並觸發 re-render，導致 infinite loop。確保 selector 回傳穩定 reference，必要時使用 `useShallow`。

## 原因

- v5 移除 store 層級 equality（`create` 簽章為何拿掉 equalityFn，見 `v5-no-equality-fn-in-create`），selector 結果預設用 `Object.is` 比較
- Inline 建立的 `{}` 或 `[]` 每次 render 都是新 reference，被認為「改變」
- 回傳值每次都不同，v5 底層的 `useSyncExternalStore` 會偵測到 snapshot 持續變化並發出警告

## ❌ Bad

```tsx
import { useStore } from './store';

function Profile() {
  // 每次 render 都建立新物件，selector 結果永遠不等於上一次
  // v5 會直接視為「值變了」，配上 useEffect 連鎖就會 infinite loop
  const profile = useStore((state) => ({
    name: state.name,
    email: state.email,
  }));

  return <div>{profile.name} / {profile.email}</div>;
}
```

升級到 v5 後常見的警告訊息：

```
The result of getSnapshot should be cached to avoid an infinite loop.
```

## ✅ Good — 取 primitive 維持穩定

```tsx
import { useStore } from './store';

function Profile() {
  const name = useStore((state) => state.name);
  const email = useStore((state) => state.email);

  return <div>{name} / {email}</div>;
}
```

各欄位獨立訂閱 primitive，預設以 `Object.is` 比較，reference 自然維持穩定。

## ✅ Good — 必須回傳物件時包 `useShallow`

```tsx
import { useShallow } from 'zustand/react/shallow';
import { useStore } from './store';

function Profile() {
  const profile = useStore(
    useShallow((state) => ({ name: state.name, email: state.email })),
  );

  return <div>{profile.name} / {profile.email}</div>;
}
```

`useShallow` 用 `useRef` 快取上次回傳值：這次結果與上次 shallow-equal 時沿用舊 reference，避免不必要的 re-render。何時才該回傳物件並包 `useShallow`，見 `perf-multiple-hooks-over-object-selector`；selector 內為何不要做轉換，見 `perf-keep-selector-simple`。
