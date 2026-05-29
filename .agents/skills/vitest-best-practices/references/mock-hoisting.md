---
rule: mock-hoisting
category: Mock 模式
tags: [mock, hoisting, vi.mock, vi.mocked]
---

# vi.mock() 被 hoist 至頂端，factory 內不可引用模組層變數

> `vi.mock()` 的 factory function 在 import 之前執行，外部模組層變數此時尚未初始化。

## 原因

- Vitest 在編譯階段將 `vi.mock()` 提升至檔案最頂端，比任何 import 還早執行，factory 內的外部變數引用在執行時永遠是 `undefined`
- 需要動態控制 mock 回傳值時，正確做法是在 factory 內放 `vi.fn()`，再用 `vi.mocked()` 於測試中設定

## ❌ Bad

```ts
import { describe, expect, it, vi } from 'vitest'
import { fetchUser } from './api'

// 看起來像是 factory 能引用到 mockFn，實際上 hoist 後 mockFn 尚未初始化
const mockFn = vi.fn()

vi.mock('./api', () => ({
  fetchUser: mockFn, // ❌ 執行時 mockFn 為 undefined
}))

describe('fetchUser', () => {
  it('returns user', async () => {
    mockFn.mockResolvedValue({ id: 1, name: 'Alice' })
    const user = await fetchUser(1)
    expect(user.name).toBe('Alice')
  })
})
```

`vi.mock()` 被提升後，`mockFn` 在 factory 執行時還沒被賦值，`fetchUser` 實際上是 `undefined`，測試執行時才拋出錯誤，問題難以追蹤。

## ✅ Good

```ts
import { describe, expect, it, vi } from 'vitest'

// factory 內直接放 vi.fn()，不依賴外部變數
vi.mock('./api', () => ({
  fetchUser: vi.fn(),
}))

import { fetchUser } from './api'

type User = { id: number; name: string }

describe('fetchUser', () => {
  it('returns user', async () => {
    vi.mocked(fetchUser).mockResolvedValue({ id: 1, name: 'Alice' } satisfies User)

    const user = await fetchUser(1)

    expect(user.name).toBe('Alice')
  })

  it('throws on error', async () => {
    vi.mocked(fetchUser).mockRejectedValue(new Error('Network error'))

    await expect(fetchUser(1)).rejects.toThrow('Network error')
  })
})
```

factory 內的 `vi.fn()` 在 hoist 後正確初始化，`vi.mocked()` 提供型別安全的 mock 操作介面，每個測試獨立設定回傳值。

## 例外

若 factory 需要引用常數，可使用 `vi.hoisted()` 將變數一起提升：

```ts
const { API_BASE } = vi.hoisted(() => ({ API_BASE: 'https://test.example.com' }))

vi.mock('./config', () => ({
  getApiBase: () => API_BASE,
}))
```
