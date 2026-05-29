---
rule: cookies-upgrade-types
category: Cookie Assertions
tags: [cookies, types, typescript]
---

# 使用 cookies API 前升級 @types/supertest

> 使用 `request.cookies` 前，將 `@types/supertest` 升至 `^7.2`

## 原因

- `request.cookies` 是 v7.2.0 新增的 API，舊版 `@types/supertest` 沒有 `cookies` 屬性的型別定義
- 未升級時 TypeScript 報 `Property 'cookies' does not exist on type 'SuperTestStatic'`

## ❌ Bad

```json
// package.json
{
  "devDependencies": {
    "@types/supertest": "^2.0.0"
  }
}
```

```typescript
const cookies = request.cookies;
// TypeScript Error: Property 'cookies' does not exist on type 'SuperTestStatic'
```

舊版型別定義沒有 `cookies` API。

## ✅ Good

```bash
npm install --save-dev @types/supertest@^7.2
```

```typescript
import request from 'supertest';

const cookies = request.cookies; // 型別正確，無 TypeScript 錯誤
```

升級後型別定義完整，IntelliSense 可用。
