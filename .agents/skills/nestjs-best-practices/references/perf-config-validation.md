---
rule: perf-config-validation
category: performance
tags: [performance, config, validation, zod, environment]
---

# 以 `ConfigModule.forRoot({ validate })` 在啟動時驗證環境變數

> 結合 Zod schema 在應用程式啟動時驗證 `.env`，缺少必要環境變數時立即失敗並報錯，不等到執行期。

## 原因

- 未驗證的環境變數在執行期才因 `undefined` 引發難以追蹤的錯誤，問題發現時已距離啟動很遠
- 啟動時驗證讓問題在部署早期（CI、容器啟動）就被攔截，不會進入服務流量
- `validate` 選項接受 `(config) => validatedConfig` 形式的函式，搭配 Zod 的 `parse` 直接整合

## ❌ Bad

```typescript
// app.module.ts
import { ConfigModule } from '@nestjs/config'

// imports 陣列中加入：
// ConfigModule.forRoot()   // 不驗證任何環境變數

// some.service.ts
import { ConfigService } from '@nestjs/config'

@Injectable()
export class SomeService {
  constructor(private readonly config: ConfigService) {}

  doSomething() {
    const apiKey = this.config.get('API_KEY')
    // API_KEY 未設定時 apiKey 為 undefined，問題延遲到執行期才爆發
    return fetch('https://api.example.com', {
      headers: { Authorization: `Bearer ${apiKey}` },
    })
  }
}
```

環境變數缺失不會在啟動時報錯，問題會在業務邏輯執行時才以模糊的方式顯現。

## ✅ Good

```typescript
// env.schema.ts
import { z } from 'zod'

export const EnvSchema = z.object({
  DATABASE_URL: z.url(),
  JWT_SECRET: z.string().min(32),
  PORT: z.coerce.number().default(3000),
  NODE_ENV: z.enum(['development', 'production', 'test']),
})
// 須涵蓋所有經 ConfigService 讀取的變數，未列入者會被 Zod strip 移除

export type Env = z.infer<typeof EnvSchema>

// app.module.ts
import { ConfigModule } from '@nestjs/config'
import { EnvSchema } from './env.schema'

// imports 陣列中加入：
// ConfigModule.forRoot({
//   validate: (config) => EnvSchema.parse(config),
//   isGlobal: true,
// })
// 缺少 DATABASE_URL 或 JWT_SECRET 時，應用程式啟動直接失敗並印出清楚的 Zod 錯誤訊息

// some.service.ts
import { ConfigService } from '@nestjs/config'
import { Env } from './env.schema'

@Injectable()
export class SomeService {
  constructor(private readonly config: ConfigService<Env, true>) {}

  doSomething() {
    const apiKey = this.config.get('JWT_SECRET', { infer: true })
    // 型別安全，且值在啟動時已確保存在
    return apiKey
  }
}
```

啟動失敗比執行期 `undefined` 好找，Zod 的錯誤訊息直接指出哪個變數缺失或格式錯誤。
