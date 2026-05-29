---
rule: request-accept-header
category: 請求建構
tags: [request, accept, content-negotiation]
---

# 測試 JSON endpoint 時設定 Accept header

> 建議設定 `.set('Accept', 'application/json')` 確保收到 JSON 格式回應

## 原因

- 部分框架根據 Accept header 做 content negotiation，未設定可能收到 HTML 格式的錯誤訊息
- JSON 格式的錯誤訊息更容易解讀與斷言

## ❌ Bad

```typescript
await request(app.getHttpServer())
  .get('/users/not-found')
  .expect(404);
// 部分框架在未設 Accept 時回傳 HTML 格式的 404，斷言 body 時格式不符
```

未設 Accept header，錯誤路徑可能回傳 HTML。

## ✅ Good

```typescript
await request(app.getHttpServer())
  .get('/users/not-found')
  .set('Accept', 'application/json')
  .expect(404);
```

明確要求 JSON，確保錯誤訊息格式一致。

## 例外

NestJS 預設回傳 JSON，此設定對純 NestJS 專案是防禦性非必要，但對混合多框架或自訂 exception filter 的專案有實際效果。
