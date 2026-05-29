---
rule: deprecated-string-format
category: 廢棄 API
tags: [deprecated, string, format, email, uuid, ip, datetime]
---

# 禁用字串格式 method，改用頂層函式

> 所有字串格式驗證已提升為頂層函式，method 形式在 v4 deprecated，下一個 major 版本將移除。

## 原因

- method 形式（`z.string().email()`）在 v4 已標記 deprecated，將於下一個 major 版本移除
- `z.string().ip()` 在 v4 已直接移除，沿用舊寫法會 runtime 錯誤
- 頂層函式具備更精確的型別推斷，e.g. `z.email()` 回傳 `ZodEmail` 而非 `ZodString`

## ❌ Bad

```typescript
import { z } from "zod";

// method 形式 — v4 deprecated
const emailSchema = z.string().email();
const uuidSchema = z.string().uuid();
const ipSchema = z.string().ip(); // v4 已移除，直接 throw

// datetime 舊系列
const dtSchema = z.string().datetime();
const dateSchema = z.string().date();
```

method 形式在 v4 deprecated，`z.string().ip()` 更是直接被移除，執行時即報錯。

## ✅ Good

```typescript
import { z } from "zod";

// 頂層函式 — v4 推薦
const emailSchema = z.email();

// UUID：通用或版本特定
const uuidSchema = z.uuid(); // 接受任意版本
const uuidv4Schema = z.uuidv4();
const uuidv7Schema = z.uuidv7();
const uuidv8Schema = z.uuidv8();

// IP：按版本分開
const ipv4Schema = z.ipv4();
const ipv6Schema = z.ipv6();

// datetime 系列改用 iso namespace
const dtSchema = z.iso.datetime();
const dateSchema = z.iso.date();
const timeSchema = z.iso.time();
const durationSchema = z.iso.duration();
```

頂層函式是 v4 的唯一正確路徑，型別更精確，且不受 deprecated 警告影響。
