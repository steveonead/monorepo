---
rule: arch-queries-stores-in-feature
category: 架構
tags: [architecture, tanstack-query, zustand, feature-sliced]
---

# Queries 與 Stores 屬 feature 範疇，放 feature 目錄下

> TanStack Query 的 queryOptions 與 Zustand store 若服務於單一 feature，放在該 feature 目錄；真正跨 feature 才放 src 根層級。

## 原因

- Query 和 store 是 feature 的內部實作，放在 feature 目錄讓 feature 真正自包含
- 移動或刪除 feature 時不需到 src/queries/、src/stores/ 搜尋相依
- 跨 feature 的 query 與 store 是例外，放 src 根層級明確標示其全域性質

## ❌ Bad

```text
src/
  queries/
    auth.ts        # 所有 auth 相關 query
    checkout.ts    # 所有 checkout 相關 query
    user.ts
  stores/
    authStore.ts
    cartStore.ts
    userStore.ts
  features/
    auth/
    checkout/
    profile/
```

features/ 下的程式碼依賴散落在 queries/ 和 stores/ 下的檔案，feature 無法自包含。

## ✅ Good

```text
src/
  features/
    auth/
      queries.ts       # auth 相關 queryOptions（queryFn、staleTime 等）
      store.ts         # auth 相關 Zustand store（token、session）
      LoginPage.tsx
      components/
    checkout/
      queries.ts       # checkout 相關 queryOptions
      store.ts         # cart / checkout step store
      CheckoutPage.tsx
      components/
    profile/
      queries.ts
      ProfilePage.tsx
  queries/             # 真正跨 feature 的 queries（罕見）
  stores/              # 真正跨 feature 的 stores（罕見）
```

每個 feature 包含自己的 query 和 store，跨 feature 的例外放 src 根層級（不進 shared/）。

## 例外

跨 feature 的 query 與 store 放 src 根層級（`src/queries/`、`src/stores/`），不放 `shared/`——shared/ 用於 UI 元件和 utility，query 與 store 的全域性質不同。
