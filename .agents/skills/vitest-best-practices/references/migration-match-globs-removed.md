---
rule: migration-match-globs-removed
category: Vitest 4 API 強制
tags: [migration, environmentMatchGlobs, poolMatchGlobs, projects]
---

# 依檔案套不同環境改用 `projects`

> Vitest 4 移除 `environmentMatchGlobs` 與 `poolMatchGlobs`。要讓不同檔案跑在不同 environment 或 pool，唯一做法是拆成多個 `projects`，各自設定 `environment` 與 `include`。

## 原因

- `environmentMatchGlobs` 在每個檔案執行前才比對 glob 決定環境，行為難預測且效能差
- 改用 `projects` 後，環境綁在 project 層級而非執行時逐檔比對，行為明確且可平行
- 兩個 match-globs 選項在 v4 已完全移除，沿用會被視為未知選項

## ❌ Bad

```ts
export default defineConfig({
  test: {
    environmentMatchGlobs: [
      ['**/*.node.test.ts', 'node'],
      ['**/*.dom.test.ts', 'jsdom'],
    ],
  },
})
```

## ✅ Good

```ts
export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: 'node',
          environment: 'node',
          include: ['**/*.node.test.ts'],
        },
      },
      {
        test: {
          name: 'dom',
          environment: 'jsdom',
          include: ['**/*.dom.test.ts'],
        },
      },
    ],
  },
})
```

每種環境一個 project，用 `include` 對應原本的 glob。monorepo 完整的 projects 設定見 `config-projects`。
