---
rule: state-client-server-separation
category: State 管理
tags: [state-management, zustand, tanstack-query]
---

# Client state 與 Server state 嚴格分離

> UI 狀態用 Zustand，API 資料用 TanStack Query，兩者不可混用。

## 原因

- 兩種 state 有不同的 invalidation 策略：UI state 跟隨使用者操作，server state 跟隨 API cache
- 混用導致 source of truth 模糊，資料同步邏輯複雜化
- TanStack Query 的 cache、dedupe、refetch 機制只對 server state 有意義

## ❌ Bad

以下職責屬於 Zustand（Client state），若改用 TanStack Query 管理會錯誤：

- modal 開關狀態
- sidebar collapse 狀態
- filter 選項、排序偏好（尚未送出 API 前的本地狀態）
- user preferences（主題、語言）

以下職責屬於 TanStack Query（Server state），若放入 Zustand store 會產生同步問題：

- 所有來自 API 的資料（使用者資料、清單、搜尋結果）
- 分頁、cursor 狀態
- mutation 結果與 optimistic update

## ✅ Good

依 state 的 invalidation 來源決定放哪裡：

**Zustand 管理（Client state）：**

- modal 開關狀態
- sidebar collapse 狀態
- filter 選項、排序偏好
- user preferences（主題、語言）

**TanStack Query 管理（Server state）：**

- 所有來自 API 的資料（使用者資料、清單、搜尋結果）
- 分頁、cursor 狀態
- mutation 結果與 optimistic update

判斷依據：這份資料的真正來源是 API 嗎？是，就交給 TanStack Query。
