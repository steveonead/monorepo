---
rule: module-shared-cross-cutting
category: 模組組織
tags: [module, shared, global, cross-cutting]
---

# SharedModule 只存放真正跨模組共用的項目

> SharedModule 收錄全域 guard、攔截器、通用工具函式；只被少數模組使用的服務留在各自的 module。

## 原因

- 濫用 SharedModule 讓依賴關係難以追蹤，任何改動都可能影響整個應用程式。
- 職責集中在對應 module 才能精確控制 export 範圍與測試邊界。

## ❌ Bad

```typescript
import { Global, Module } from '@nestjs/common'
import { AuthGuard } from './auth.guard'
import { EmailService } from './email.service'   // 只有 auth module 用
import { InternalUserHelper } from './internal-user.helper'
import { LoggerService } from './logger.service'
import { PdfService } from './pdf.service'       // 只有 billing module 用

@Global()
@Module({
  providers: [AuthGuard, LoggerService, EmailService, PdfService, InternalUserHelper],
  exports: [AuthGuard, LoggerService, EmailService, PdfService, InternalUserHelper],
})
export class SharedModule {}
```

`EmailService` 和 `PdfService` 只被單一模組使用，卻放在 SharedModule，增加不必要的耦合。

## ✅ Good

```typescript
import { Global, Module } from '@nestjs/common'
import { AuthGuard } from './auth.guard'
import { LoggerService } from './logger.service'

@Global()
@Module({
  providers: [AuthGuard, LoggerService],
  exports: [AuthGuard, LoggerService], // 真正全域共用的
})
export class SharedModule {}

// EmailService 放在需要它的 module
import { Module } from '@nestjs/common'
import { AuthService } from './auth.service'
import { EmailService } from './email.service'

@Module({
  providers: [AuthService, EmailService],
  exports: [AuthService],
})
export class AuthModule {}
```

SharedModule 只放 `AuthGuard`、`LoggerService` 等跨模組共用的項目，`EmailService` 留在 `AuthModule`。
