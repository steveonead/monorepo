---
rule: v4-removed-config-keys
category: V4 API 合規
tags: [v4, api, breaking-change, workspace, poolMatchGlobs, projects]
---

# 禁用 v4 已移除或棄用的 config key

> `poolMatchGlobs` 和 `environmentMatchGlobs` 在 v4 移除；`workspace` 自 v3.2 起棄用。三者均改用 `projects`。

## 原因

- `poolMatchGlobs` 和 `environmentMatchGlobs` 在 v4 migration guide「Deprecated APIs are Removed」明確列為已移除，設定靜默失效
- `workspace` 在 Vitest 3.2 重新命名為 `projects`，持續使用會在未來 major release 中移除

## ❌ Bad

```ts
// vitest.config.ts
export default defineConfig({
  test: {
    environmentMatchGlobs: [
      ['**/*.spec.tsx', 'happy-dom'],
      ['**/*.test.ts', 'node'],
    ],
    poolMatchGlobs: [
      ['**/*.test.ts', 'forks'],
    ],
    workspace: './vitest.workspace.ts', // v3.2 deprecated
  },
})
```

v4 中 `environmentMatchGlobs` 和 `poolMatchGlobs` 完全失效；`workspace` 遲早移除。

## ✅ Good

```ts
// vitest.config.ts
export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: 'component',
          include: ['**/*.spec.tsx'],
          environment: 'happy-dom',
          pool: 'vmThreads',
        },
      },
      {
        test: {
          name: 'unit',
          include: ['**/*.test.ts'],
          environment: 'node',
          pool: 'forks',
        },
      },
    ],
  },
})
```

`projects` 統一管理多環境設定，每個 project 可獨立設定 environment 和 pool。
