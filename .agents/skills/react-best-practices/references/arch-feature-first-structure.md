---
rule: arch-feature-first-structure
category: 架構
tags: [architecture, folder-structure, feature-sliced]
---

# Feature-first 資料夾結構，不按技術類型分類

> 按業務 feature 組織程式碼，刪除或移動 feature 時所有相依都在同一個目錄下。

## 原因

- 按技術類型分類（components/、hooks/、pages/）讓同一 feature 的程式碼散落在多個目錄
- feature 目錄讓刪除或移動一個業務模組時影響範圍清楚，不需全域搜尋
- 跨 feature 的真正共用才放 shared/，強迫思考哪些是真的共用、哪些只是巧合相同

## ❌ Bad

```text
src/
  components/
    Button.tsx
    UserCard.tsx
    CheckoutForm.tsx
  hooks/
    useAuth.ts
    useCart.ts
    useUser.ts
  pages/
    LoginPage.tsx
    CheckoutPage.tsx
    ProfilePage.tsx
```

同一業務（如 checkout）的元件、hook、頁面分散在三個目錄，修改 checkout 流程需到處找檔案。

## ✅ Good

```text
src/
  features/
    auth/
      LoginPage.tsx
      useAuth.ts
      components/
        LoginForm.tsx
    checkout/
      CheckoutPage.tsx
      useCart.ts
      components/
        CheckoutForm.tsx
    profile/
      ProfilePage.tsx
      useUser.ts
      components/
        UserCard.tsx
  shared/
    ui/
      Button.tsx       # 真正跨 feature 的設計系統元件
    hooks/             # 真正跨 feature 的 custom hooks
    utils/             # pure utility functions
```

每個 feature 自包含，刪除 checkout 只需移除 features/checkout/ 目錄。
