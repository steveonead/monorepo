---
rule: parse-boundary-validation
category: 解析邊界
tags: [解析邊界, boundary, architecture, trust]
---

# 在系統邊界驗證輸入，邊界內信任 TypeScript 型別

> 驗證只在系統邊界（API handler、form handler、env var 載入、外部 API response）發生；邊界內部信任 TypeScript 型別，不重複呼叫 parse。

## 原因

- 邊界驗證確保輸入合法後，內部程式碼可以完全信任靜態型別，不需防禦性驗證。
- 在多處重複 parse 同一份資料，增加執行開銷，也讓程式碼意圖不清晰。
- 邊界定義清楚，可降低 schema 修改時的影響範圍。

## ❌ Bad

```typescript
// service layer — 不必要的重複驗證
export const processOrder = async (rawOrder: unknown) => {
  // 已在 handler 驗證過，這裡再 parse 是多餘的
  const order = OrderSchema.parse(rawOrder);
  await chargeCard(order);
  await updateInventory(order);
};

// 呼叫端在 handler 驗證後，傳入的是 Order 型別
// processOrder 卻接收 unknown 並再次 parse
```

在服務層重複驗證，代表不信任自己的型別系統，造成多餘開銷與混亂意圖。

## ✅ Good

```typescript
import { z } from 'zod';

const OrderSchema = z.object({
  id: z.string(),
  amount: z.number(),
  currency: z.string(),
});

type Order = z.infer<typeof OrderSchema>;

// 邊界：API route handler — 唯一做驗證的地方
export const createOrderHandler = async (req: Request, res: Response) => {
  const result = OrderSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ errors: result.error.issues });
    return;
  }
  // 邊界內：傳遞強型別，不再 parse
  await processOrder(result.data);
  res.json({ ok: true });
};

// 內部 service — 接受強型別，信任型別系統
const processOrder = async (order: Order) => {
  await chargeCard(order);
  await updateInventory(order);
};
```

驗證集中在邊界，內部 service 接受強型別，職責明確。

## 例外

外部 API response（第三方服務回傳的資料）屬於另一個信任邊界，即使在內部 service 呼叫，仍應在收到 response 時即時驗證：

```typescript
// 呼叫外部 API — 這是另一個邊界，需要驗證
const fetchUserProfile = async (userId: string) => {
  const raw = await externalApi.get(`/users/${userId}`);
  const result = ExternalUserSchema.safeParse(raw);
  if (!result.success) throw new Error('Unexpected external API shape');
  return result.data;
};
```
