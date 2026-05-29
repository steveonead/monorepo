---
rule: error-throw-not-null
category: error-handling
tags: [error-handling, service-layer, http-exception, controller]
---

# Service 找不到資源時拋 Exception，不回傳 null

> 找不到資源就拋 `NotFoundException`，讓 Controller 保持薄層。

## 原因

- 回傳 `null` 讓 Controller 必須做 null 檢查才能給出正確 HTTP 狀態碼，業務邏輯洩漏到 Controller 層。
- 拋 `NotFoundException` 讓 Global Exception Filter 統一處理，Controller 只需描述成功路徑。

## ❌ Bad

```typescript
// users.service.ts
async findOne(id: string): Promise<UserDto | null> {
  return this.repo.findById(id) ?? null
}

// users.controller.ts
async findOne(@Param('id') id: string) {
  const user = await this.usersService.findOne(id)
  if (!user) throw new NotFoundException()
  return user
}
```

「找不到時回傳 404」是業務規則，卻寫在 Controller 裡，每個呼叫 `findOne` 的地方都要重複這段檢查。

## ✅ Good

```typescript
// users.service.ts
async findOne(id: string): Promise<UserDto> {
  const user = await this.repo.findById(id)
  if (!user) throw new NotFoundException(`User ${id} not found`)
  return user
}

// users.controller.ts
async findOne(@Param('id') id: string): Promise<UserDto> {
  return this.usersService.findOne(id)
}
```

Service 封裝完整的業務規則，Controller 只描述成功路徑，錯誤由 Global Exception Filter 統一轉換為 HTTP 回應。
