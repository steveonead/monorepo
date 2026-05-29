---
rule: query-priority-order
category: query
tags: [query, role, testid, accessibility]
---

# Query 優先序

> 依官方優先序選擇 query，`getByRole` 最優先，`getByTestId` 最後手段。

## 原因

- 越靠前的 query 越貼近使用者操作視角，同時驗證可訪問性
- `getByTestId` 依賴 `data-testid` 屬性，屬實作細節，應窮盡其他 query 後才使用
- 遵循優先序，測試自動反映 ARIA 語意，不需額外 a11y 檢查

## ❌ Bad

```tsx
// 直接用 testId，跳過所有語意 query
screen.getByTestId('submit-button');
```

跳過 role、label 等語意 query，測試與可訪問性脫鉤。

## ✅ Good

```tsx
// 優先用 role，同時驗證可訪問性
screen.getByRole('button', { name: /送出/i });

// 表單欄位依序：labelText > placeholderText > displayValue
screen.getByLabelText(/電子郵件/i);
screen.getByDisplayValue('已填入的值');

// 靜態文字內容
screen.getByText(/歡迎回來/i);

// 最後手段
screen.getByTestId('custom-datepicker');
```

完整優先序（官方）：`getByRole > getByLabelText > getByPlaceholderText > getByText > getByDisplayValue > getByAltText > getByTitle > getByTestId`。

## 例外

第三方元件無法加 role 或 label 時，才使用 `getByTestId`。
