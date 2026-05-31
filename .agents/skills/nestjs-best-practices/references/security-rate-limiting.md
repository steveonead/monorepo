---
rule: security-rate-limiting
category: security
tags: [security, throttler, rate-limit, brute-force, auth]
---

# 以 `@nestjs/throttler` 全局實作 Rate Limiting，敏感端點設更嚴格的限制

> 全局套用基本限流防止 API 濫用，登入等敏感端點以 `@Throttle()` 覆蓋更嚴格的設定。

## 原因

- 無限流的 API 讓攻擊者可以無限次嘗試密碼、觸發簡訊或 Email 發送
- 全局限流是防線基線，敏感端點需要獨立更嚴格的閾值才能抵擋暴力攻擊
- `@nestjs/throttler` 是 NestJS 官方維護的套件，與全局 `APP_GUARD` 機制直接整合
- 範例語法需要 `@nestjs/throttler` **v5 以上**（`forRoot([configs])` 陣列格式與 `@Throttle({ default: {...} })` 物件語法均為 v5 breaking change）

## ❌ Bad

```typescript
// auth.controller.ts
@Post('login')
async login(@Body() dto: LoginDto) {
  return this.authService.login(dto)
  // 無限流，攻擊者可無限次嘗試密碼
}

@Post('password-reset')
async requestPasswordReset(@Body() dto: PasswordResetDto) {
  return this.authService.requestPasswordReset(dto)
  // 無限流，可被用來大量發送重設 Email
}
```

缺少限流讓暴力破解與資源濫用成為可能，且問題難以在開發階段察覺。

## ✅ Good

```typescript
// app.module.ts
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler'
import { APP_GUARD } from '@nestjs/core'

// imports 陣列中加入：
// ThrottlerModule.forRoot([{
//   ttl: 60000,   // 時間窗口：1 分鐘（毫秒）
//   limit: 100,   // 每 IP 最多 100 次請求
// }])
//
// providers 陣列中加入：
// { provide: APP_GUARD, useClass: ThrottlerGuard }

// auth.controller.ts
import { Throttle } from '@nestjs/throttler'

const ONE_MINUTE_MS = 60_000
const ONE_HOUR_MS = 3_600_000

@Throttle({ default: { ttl: ONE_MINUTE_MS, limit: 5 } })
@Post('login')
async login(@Body() dto: LoginDto) {
  return this.authService.login(dto)
}

@Throttle({ default: { ttl: ONE_HOUR_MS, limit: 3 } })
@Post('password-reset')
async requestPasswordReset(@Body() dto: PasswordResetDto) {
  return this.authService.requestPasswordReset(dto)
}
```

全局基本限流保護所有端點，敏感端點的嚴格限制讓暴力攻擊難以成立。

## 例外

健康檢查端點、內部服務間呼叫（已有 IP 白名單控制）可用 `@SkipThrottle({ default: true })` 跳過限流。

v5 起需明確指定要略過的 throttler 名稱（對應 ThrottlerModule.forRoot 中設定的名稱）；若使用預設無名 throttler，傳入 `{ default: true }`；無參數形式已不再有效。
