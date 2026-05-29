---
rule: api-brand
category: v4 新 API 採用
tags: [v4, brand, nominal-type, id]
---

# 用 `z.brand()` 表達 nominal type，防止不同 ID 型別互換

> `z.brand()` 讓底層結構相同的型別在型別層面不可互換，是防止 ID 混用的最輕量解法。

## 原因

- TypeScript 結構型別系統讓 `string` 與 `string` 可互換，`UserId` 傳入需要 `PostId` 的函式不會報錯
- `z.brand()` 在型別層面附加 phantom type，runtime 行為完全不變
- branded type 從 schema 推斷，不需手寫額外 type 定義

## ❌ Bad

```typescript
import { z } from "zod";

const UserIdSchema = z.string();
const PostIdSchema = z.string();

type UserId = z.infer<typeof UserIdSchema>;
type PostId = z.infer<typeof PostIdSchema>;

const deletePost = (postId: PostId) => { /* ... */ };

const userId = "u_123" as UserId;
deletePost(userId); // 型別層面不報錯，但語意錯誤
```

`UserId` 與 `PostId` 底層都是 `string`，TypeScript 視為相同型別，傳錯不會報錯。

## ✅ Good

```typescript
import { z } from "zod";

const UserIdSchema = z.string().brand("UserId");
const PostIdSchema = z.string().brand("PostId");

type UserId = z.infer<typeof UserIdSchema>;
type PostId = z.infer<typeof PostIdSchema>;

const deletePost = (postId: PostId) => { /* ... */ };

const userId = UserIdSchema.parse("u_123"); // 型別為 UserId
deletePost(userId); // ❌ Type error：UserId 不可指派給 PostId
```

`brand()` 讓兩個 schema 推斷出不同型別，誤傳在編譯期即被攔截，runtime 無額外開銷。
