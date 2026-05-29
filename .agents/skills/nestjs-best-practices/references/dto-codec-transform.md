---
rule: dto-codec-transform
category: DTO
tags: [dto, zod, codec, transform, serialization]
---

# 雙向資料轉換以 codec 模式實作（需 Zod 4.1+）

> `z.codec()` 明確定義 decode（請求輸入）與 encode（回應輸出）兩個方向，避免型別混淆。

## 原因

- `.transform()` 只定義單向轉換，回應序列化時 Date 物件無法自動轉回 ISO string。
- `z.codec()` 將 decode 與 encode 邏輯集中在一處，方向明確不易出錯。
- 搭配 `createZodDto(schema, { codec: true })` 告知 nestjs-zod 請求時用 parse，回應時用 encode。

## ❌ Bad

```typescript
import { z } from 'zod'
import { createZodDto } from 'nestjs-zod'

const EventSchema = z.object({
  startAt: z.string().transform(val => new Date(val)),
})

export class EventDto extends createZodDto(EventSchema) {}
// 回應序列化時 Date 物件無法自動轉回 ISO string
```

`.transform()` 只處理輸入方向，序列化回應時 `Date` 會變成 `{}` 或觸發錯誤。

## ✅ Good

```typescript
import { z } from 'zod'
import { createZodDto } from 'nestjs-zod'

const dateCodec = z.codec(
  z.iso.datetime(),  // input：ISO string
  z.date(),          // output：Date
  {
    decode: (val) => new Date(val),
    encode: (val) => val.toISOString(),
  }
)

const EventSchema = z.object({
  startAt: dateCodec,
})

export class EventDto extends createZodDto(EventSchema, { codec: true }) {}
```

decode 處理請求驗證，encode 處理回應序列化，`{ codec: true }` 讓 DTO 序列化時改用 encode。
