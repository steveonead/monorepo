---
rule: dto-type-inference
category: DTO
tags: [dto, zod, typescript, type-inference]
---

# 用 `z.infer` 取得輸出型別，需要輸入型別時改用 `z.input`

> 不手寫 interface，直接從 schema 推斷型別，消除雙重維護。

## 原因

- 手寫 interface 與 schema 是兩份定義，修改 schema 時 interface 容易忘記同步。
- `z.infer` 等同 `z.output`，是 transform 後的型別，為預設使用情境。
- schema 有 `.transform()` 且需描述輸入格式時，明確改用 `z.input` 表達意圖。

## ❌ Bad

```typescript
import { z } from 'zod'

const CreateUserSchema = z.object({
  name: z.string(),
  email: z.email(),
  birthDate: z.string().transform(val => new Date(val)),
})

// 手寫 interface，與 Zod schema 分離，容易 diverge
type CreateUserRequest = {
  name: string
  email: string
  birthDate: string  // 忘了跟 schema 的 transform 同步
}
```

手寫型別在 schema 更新後不會觸發編譯錯誤，靜默錯誤難以發現。

## ✅ Good

```typescript
import { z } from 'zod'

const CreateUserSchema = z.object({
  name: z.string(),
  email: z.email(),
  birthDate: z.string().transform(val => new Date(val)),
})

// 輸入型別：caller 傳入的原始資料格式
type CreateUserInput = z.input<typeof CreateUserSchema>
// { name: string; email: string; birthDate: string }

// 輸出型別：parse 後在應用層使用的格式
type CreateUserOutput = z.infer<typeof CreateUserSchema>
// { name: string; email: string; birthDate: Date }
```

型別直接從 schema 推斷，schema 改動時型別自動同步，編譯器即時報錯。
