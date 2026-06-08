---
rule: deprecated-number-int
category: 廢棄 API
tags: [deprecated, number, int, integer, float]
---

# 禁用 `z.number().int()`，改用數值頂層函式

> v4 新增 `z.int()` 系列數值頂層函式，`z.number().int()` 官方建議遷移，新寫的 schema 一律用頂層函式。

## 原因

- v4 官方建議從 `z.number().int()` 遷移至 `z.int()`，頂層函式與 `z.email()` 等字串格式命名方向一致
- `z.int32()`、`z.uint32()` 等型別帶有內建範圍限制，對應後端固定寬度整數，`z.number().int()` 做不到這件事
- 頂層函式語意直接，一眼看出整數或浮點數意圖，`z.number().int()` 是附加限制而非獨立型別

## ❌ Bad

```typescript
import { z } from 'zod';

// z.number().int() — 官方建議遷移
const ageSchema = z.number().int();
```

`z.number().int()` 在 v4 雖不報錯，但已有更精確的替換方案，繼續使用是遺留寫法。

## ✅ Good

```typescript
import { z } from 'zod';

// 整數：選擇對應範圍的頂層函式
const ageSchema = z.int();      // [MIN_SAFE_INTEGER, MAX_SAFE_INTEGER]
const portSchema = z.uint32();  // [0, 4294967295]，適合 port / id 等非負整數
const flagSchema = z.int32();   // [-2147483648, 2147483647]，對應後端 int32

// 浮點數：明確表達精度需求
const latSchema = z.float64();  // 標準 JS number，等同預設精度
const weightSchema = z.float32(); // 32-bit float，對應後端 float
```

頂層函式直接表達型別意圖，`z.uint32()` 同時帶範圍驗證，省去手動 `.min(0).max(4294967295)`。
