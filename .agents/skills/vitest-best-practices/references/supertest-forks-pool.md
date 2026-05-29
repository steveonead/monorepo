---
rule: supertest-forks-pool
category: Supertest 整合
tags: [vitest, pool, forks, isolation]
---

# e2e 測試加上 pool: 'forks'

> e2e 的 vitest config 設 `pool: 'forks'`，每個測試檔跑在獨立 process

## 原因

- 預設 threads pool 跨 worker 共享 V8 isolate，NestJS DI 容器、DB 連線等 module-level singleton 會互相污染
- `forks` 讓每個測試檔有獨立 process，是有 DB 操作的 e2e 測試的安全選項

## ❌ Bad

```typescript
// vitest.config.e2e.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['**/*.e2e-spec.ts'],
    // 未設 pool，預設 threads，DI 容器可能跨 worker 污染
  },
});
```

預設設定下，多個測試檔並行時 singleton 可能跨 worker 共享。

## ✅ Good

```typescript
// vitest.config.e2e.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['**/*.e2e-spec.ts'],
    pool: 'forks',
    isolate: true,
  },
});
```

每個測試檔跑在獨立 process，DI 容器完全隔離。
