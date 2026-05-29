---
rule: async-renderhook-scope
category: async
tags: [async, renderHook, hook, component-test]
---

# renderHook 使用範圍

> `renderHook` 用於可重用 hook 的隔離測試；應用層元件的 hook 優先透過元件測試覆蓋。

## 原因

- `renderHook` 主要供 hook library 使用，官方建議應用層優先用元件測試
- 透過元件測試同時驗證 hook 與 UI 整合，覆蓋更完整
- 單純測試應用層 hook 是重複測試，維護成本高但不帶來額外保障

## ❌ Bad

```tsx
// useModalState 只被單一元件使用，無需獨立測試
const { result } = renderHook(() => useModalState());
act(() => result.current.open());
expect(result.current.isOpen).toBe(true);
```

透過元件測試已能完整覆蓋，這層測試是重複且脆弱的。

## ✅ Good

```tsx
// 可重用 hook（設計給多個元件或外部使用）：用 renderHook 隔離
const { result } = renderHook(() => usePagination({ total: 100, pageSize: 10 }));
expect(result.current.page).toBe(1);
expect(result.current.totalPages).toBe(10);

// 應用層元件專用 hook：透過元件測試
render(<Modal />);
await userEvent.click(screen.getByRole('button', { name: /開啟/i }));
expect(screen.getByRole('dialog')).toBeInTheDocument();
```

可重用 hook 用 `renderHook` 隔離驗證 API；應用層 hook 透過元件測試驗證整合行為。
