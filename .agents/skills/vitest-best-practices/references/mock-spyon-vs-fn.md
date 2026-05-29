---
rule: mock-spyon-vs-fn
category: Mock 模式
tags: [mock, spyOn, fn, restore]
---

# 用途決定選擇：vi.spyOn vs vi.fn()

> 需要還原的場景用 `vi.spyOn`，獨立 mock 用 `vi.fn()`。

## 原因

- `vi.spyOn` 包裝既有物件的方法，支援 `mockRestore()` 將原始實作還原，避免測試之間互相污染
- `vi.fn()` 建立全新 mock function，不依附任何物件，無法還原至「原始狀態」，因為根本沒有原始狀態

## ❌ Bad

```ts
import { afterEach, expect, test, vi } from 'vitest'

const originalError = console.error
console.error = vi.fn()

test('logs error', () => {
  triggerError()
  expect(console.error).toHaveBeenCalled()
})

// 手動備份與還原容易出錯，測試失敗時 afterEach 可能跳過
afterEach(() => {
  console.error = originalError
})
```

手動備份與還原容易出錯，測試失敗時 `afterEach` 可能跳過，導致後續測試的 console 輸出被吞掉。

## ✅ Good

```ts
import { expect, test, vi } from 'vitest'
import { render } from '@testing-library/react'

// 需要還原 → vi.spyOn（搭配 restoreMocks: true 自動處理）
test('suppresses console.error during render', () => {
  const spy = vi.spyOn(console, 'error').mockImplementation(() => {})

  renderWithError()

  expect(spy).toHaveBeenCalledWith(
    expect.stringContaining('Warning:'),
  )
})
```

```ts
import { expect, test, vi } from 'vitest'

type OnSubmit = (data: { email: string }) => void

// 獨立 callback → vi.fn()
test('calls onSubmit with form data', async () => {
  const onSubmit = vi.fn<OnSubmit>()

  renderForm(onSubmit)
  await userEvent.type(emailInput, 'test@example.com')
  await userEvent.click(submitButton)

  expect(onSubmit).toHaveBeenCalledWith({ email: 'test@example.com' })
})
```

`vi.fn()` 直接描述意圖：這是一個測試用的假函式，不需要依附任何物件，也不涉及還原問題。

## 例外

設定 `restoreMocks: true`（vitest.config.ts）時，`vi.spyOn` 的還原會在每次測試後自動處理，不需要在每個測試另寫 `afterEach`。
