---
rule: parse-input-output-types
category: 解析邊界
tags: [解析邊界, transform, coercion, z.input, z.output, z.infer]
---

# 有 transform 時，輸入用 z.input，輸出用 z.output

> `z.input` 表示傳入 parse 的型別；`z.output`（等同 `z.infer`）表示 parse 後的型別；有 transform 時兩者不同，必須明確區分。

## 原因

- `z.infer` 等同 `z.output`，只在 input/output 型別相同時使用是安全的。
- 有 `transform` 或 `coerce` 時，input 與 output 型別不同；若誤用 `z.infer` 代表 input，會導致傳錯型別給 `safeParse()` 而 TypeScript 不報錯。
- 明確區分兩者，讓 form handler、API handler 的型別意圖清晰可見。

## ❌ Bad

```typescript
import { z } from 'zod';

const CreatePostSchema = z.object({
  title: z.string(),
  publishedAt: z.string().transform((s) => new Date(s)), // input: string, output: Date
});

// 誤用 z.infer 代表 input 型別
type CreatePostInput = z.infer<typeof CreatePostSchema>;
// 實際上 CreatePostInput = { title: string; publishedAt: Date }
// 但 form 送出的是 { title: string; publishedAt: string }
// TypeScript 不會報錯，但概念上是錯的

const handleSubmit = (formData: CreatePostInput) => {
  // formData.publishedAt 被推斷為 Date，但實際是 string
  CreatePostSchema.parse(formData);
};
```

`z.infer` 在有 transform 的 schema 上等於 output 型別，拿來標記 input 會讓使用端型別錯誤。

## ✅ Good

```typescript
import { z } from 'zod';

const CreatePostSchema = z.object({
  title: z.string(),
  publishedAt: z.string().transform((s) => new Date(s)),
});

// 明確區分：用 z.input 標記送入 parse 的資料型別
type CreatePostInput = z.input<typeof CreatePostSchema>;
// { title: string; publishedAt: string }

// 用 z.output 標記 parse 完成後的資料型別
type CreatePost = z.output<typeof CreatePostSchema>;
// { title: string; publishedAt: Date }

// form handler 接受 input 型別
const handleSubmit = (formData: CreatePostInput) => {
  const result = CreatePostSchema.safeParse(formData);
  if (!result.success) return;
  // result.data 是 CreatePost，publishedAt 已是 Date
  savePost(result.data);
};

// service 接受 output 型別
const savePost = (post: CreatePost) => {
  // post.publishedAt 是 Date，型別正確
};
```

`z.input` 對應表單/API 收到的原始資料型別，`z.output` 對應驗證轉換後的業務物件型別。

## 例外

若 schema 沒有任何 `transform` 或 `coerce`，`z.input` 等於 `z.output`，此時用 `z.infer` 即可，無需區分。
