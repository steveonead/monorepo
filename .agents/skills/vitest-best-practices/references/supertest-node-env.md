---
rule: supertest-node-env
category: Supertest 整合
tags: [supertest, node, globalSetup, environment]
---

# Supertest 測試用 node environment；globalSetup 放 root 層級

> supertest 測試設 `environment: 'node'`；若有 `globalSetup`，放在 root `test.globalSetup`，不放在 `projects` 子項目內。

## 原因

- supertest 直接操作 Node.js HTTP server，不需要 DOM 模擬，`node` environment 最輕量
- `globalSetup` 在官方文件中示範為 root-level 設定，放在 `projects` 子項目內的行為未有文件保證

## ❌ Bad

```ts
// vitest.config.ts
export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: 'api',
          environment: 'node',
          globalSetup: ['./test/server-setup.ts'], // ❌ 子項目內放 globalSetup，文件未保證
        },
      },
    ],
  },
})
```

## ✅ Good

```ts
// vitest.config.ts
export default defineConfig({
  test: {
    globalSetup: ['./test/server-setup.ts'], // root-level，行為有文件保證
    projects: [
      {
        test: {
          name: 'api',
          include: ['src/**/*.api.test.ts'],
          environment: 'node',
        },
      },
    ],
  },
})
```
