---
rule: deprecated-record-single-arg
category: 廢棄 API
tags: [deprecated, record, breaking-change]
---

# `z.record()` 必須傳入兩個參數

> v4 Breaking change：`z.record(valueSchema)` 單參數用法已移除，必須明確指定 key schema 與 value schema：`z.record(z.string(), valueSchema)`。

## 原因

- 單參數形式在 v4 已完全 REMOVED（不是 deprecated，是直接移除），呼叫即 runtime error
- 兩個參數明確表達 key 的型別約束，語意更清楚
- key schema 不限於 `z.string()`，可用 `z.enum()` 等限制 key 的值域

## ❌ Bad

```ts
// v4 已移除，runtime error
const RecordSchema = z.record(z.string());
```

v4 不再接受單參數，此寫法無法通過 Zod 內部型別檢查，執行時直接拋錯。

## ✅ Good

```ts
// 明確指定 key schema 與 value schema
const RecordSchema = z.record(z.string(), z.string());
export type Record = z.infer<typeof RecordSchema>;

// key 可進一步限制為特定字串集合
const StatusMap = z.record(
  z.enum(["active", "inactive", "pending"]),
  z.number(),
);
export type StatusMap = z.infer<typeof StatusMap>;
```

兩個參數讓 key 與 value 的型別約束都明確可見，`z.enum()` 作為 key schema 時，TypeScript 會確保所有合法 key 都有對應值。
