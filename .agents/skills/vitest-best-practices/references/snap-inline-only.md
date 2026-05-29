---
rule: snap-inline-only
category: Snapshot
tags: [snapshot, inline, testing]
---

# 用 inline snapshot 鎖定小範圍輸出

> 避免對大型 component tree 或完整 API response 使用 snapshot；改用 `toMatchInlineSnapshot` 鎖定特定欄位或字串。

## 原因

- 大型 snapshot 每次 UI 或 response 結構調整都要更新，變更頻繁、訊號雜訊比低
- inline snapshot 範圍小，diff 清晰，什麼改了一目了然

## ❌ Bad

```ts
// 整個 component tree 或完整 API response 全鎖起來
expect(wrapper.html()).toMatchSnapshot()
expect(apiResponse).toMatchSnapshot()
```

任何子元件或欄位調整都會導致 snapshot 失效，更新負擔高。

## ✅ Good

```ts
// 鎖定特定的文字輸出
expect(button.textContent).toMatchInlineSnapshot(`"Submit order"`)

// 鎖定關鍵欄位，不鎖整個物件
expect(apiResponse.status).toMatchInlineSnapshot(`"success"`)
expect(apiResponse.data.name).toMatchInlineSnapshot(`"Alice"`)
```

inline snapshot 鎖定你真正在意的部分，改了不相關的欄位不會觸發失敗。
