---
rule: query-type-selection
category: query
tags: [query, getBy, queryBy, findBy, async]
---

# getBy / queryBy / findBy 按用途嚴格對應

> 三種 query 型態各有明確用途，混用會讓錯誤訊息誤導、或讓非同步競爭條件悄悄潛入。

## 原因

- `getBy*` 找不到元素會立刻 throw，錯誤訊息精確指向問題；用 `queryBy*` 代替只會得到 `null`，`expect` 的失敗訊息更難讀。
- `queryBy*` 只適合「斷言元素不存在」；其他情況用它等於放棄了自動的 throw 保護。
- `findBy*` 內建 `waitFor`，非同步場景用 `getBy*` 會在 Promise resolve 前就查詢，必定失敗。

| 型態 | 用途 |
|------|------|
| `getBy*` | 元素應同步存在，找不到直接 throw |
| `queryBy*` | 只用於斷言元素不存在 |
| `findBy*` | 非同步等待元素出現（內部已包 waitFor） |

## ❌ Bad

```tsx
// 用 queryBy 查詢應當存在的元素，錯誤訊息難以理解
const button = screen.queryByRole('button', { name: /提交/i });
expect(button).toBeInTheDocument();

// 用 getBy 查詢不應存在的元素，元素不存在時直接 throw，never reach expect
const error = screen.getByText(/錯誤/i);
expect(error).not.toBeInTheDocument();
```

## ✅ Good

```tsx
// 元素應存在：getBy*
const button = screen.getByRole('button', { name: /提交/i });

// 斷言不存在：queryBy*
expect(screen.queryByText(/錯誤/i)).not.toBeInTheDocument();

// 非同步出現：findBy*
const alert = await screen.findByRole('alert');
```

用途對應正確，測試失敗時訊息直接指向真正的問題。
