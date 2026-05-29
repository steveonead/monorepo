---
rule: safety-schema-validator
category: 型別安全
tags: [safety, validation, zod, runtime]
---

# 系統邊界用 schema validator 解析外部輸入

> API response、form data、URL params 等外部輸入一律透過 Zod/Valibot 在系統邊界解析，優先用 `safeParse` 優雅處理錯誤。

## 原因

- TypeScript 型別在 runtime 消失，不加 runtime 驗證等同沒有保護
- 外部輸入（API、使用者、URL）可能不符合預期型別，未驗證直接使用會導致難以追查的錯誤
- `safeParse` 回傳結構化錯誤，讓邊界層可以優雅處理，不讓例外傳播

## ❌ Bad

```ts
const response = await fetch("/api/user");
const user = (await response.json()) as User; // 只是 cast，沒有任何 runtime 保護
console.log(user.name.toUpperCase()); // 若 API 回傳格式不符，runtime crash
```

`as User` 只是告訴 TypeScript 信任這個值，若 API 實際回傳 `null`、缺少欄位或格式錯誤，程式會在 runtime crash 且錯誤訊息難以定位。

## ✅ Good

```ts
import { z } from "zod";

const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.email(),
});

const response = await fetch("/api/user");
const json = await response.json();

const result = UserSchema.safeParse(json);
if (!result.success) {
  logger.error("Invalid API response", result.error.flatten());
  throw new ApiError("Unexpected response format");
}

const user = result.data; // 型別安全，已驗證
```

`safeParse` 不拋出例外，而是回傳 `{ success: true, data }` 或 `{ success: false, error }`，讓邊界層可以主動處理格式錯誤並記錄有意義的錯誤訊息。

## 例外

測試 fixture 或已驗證的內部資料可用 `parse`（驗證失敗直接 throw，適合測試快速失敗）：

```ts
const mockUser = UserSchema.parse({ id: "1", name: "Alice", email: "a@b.com" });
```
