# TanStack Router 作為前端路由解決方案

選擇 TanStack Router 而非 React Router v7，主要原因是 **type-safe routing**：route params、search params、navigation 均有完整 TypeScript 型別推斷，重構時能在 compile time 發現錯誤。

## 實作說明

- `routeTree.gen.ts` 為 TanStack Router codegen artifact，commit 進 repo（官方推薦做法）
- 採用 file-based routing，路由結構對應 `src/routes/` 目錄

## 接受的代價

- 生態系與社群資源比 React Router 小
