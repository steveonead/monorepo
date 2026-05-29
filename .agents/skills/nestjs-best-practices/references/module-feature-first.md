---
rule: module-feature-first
category: 模組組織
tags: [module, architecture, folder-structure]
---

# 以 Feature Domain 為頂層組織單位

> 頂層資料夾應為 `auth/`、`orders/`、`billing/`，不以技術角色（controllers/services）分層。

## 原因

- 修改一個功能時，所有相關檔案都在同一個目錄，不需跨多個頂層資料夾。
- NestJS 官方 sample 一致示範以 feature domain 為組織單位。

## ❌ Bad

```
src/
  controllers/
    users.controller.ts
    orders.controller.ts
  services/
    users.service.ts
    orders.service.ts
  repositories/
    users.repository.ts
```

以技術角色分層，修改 `users` 功能時需同時打開三個目錄。

## ✅ Good

```
src/
  users/
    users.controller.ts
    users.service.ts
    users.repository.ts
    users.module.ts
    dto/
  orders/
    orders.controller.ts
    orders.service.ts
    orders.module.ts
    dto/
```

每個 feature domain 自成一個目錄，相關檔案集中在一起。
