---
rule: mocking-automock-behavior
category: Mock 與 Spy
tags: [mocking, automock, getter, prototype, spyOn]
---

# Automock getter 預設回傳 undefined，用 spyOn 覆寫

> automock 的 getter 預設回傳 `undefined`，不呼叫原始 getter。要控制 getter 值改用 `vi.spyOn(obj, key, 'get')`。automock 的 method 也無法被 `mockRestore` 還原。

## 原因

- v3 automock getter 會呼叫原始 getter，常造成非預期的副作用，v4 統一回傳 `undefined`
- automock 的 method 掛在 prototype，修改 prototype 實作會影響所有 instance，設定一次就套用到整批實例
- automock 方法不可 restore，避免測試誤以為能還原 automock 而寫出失效的清理

## ❌ Bad

```ts
vi.mock(import('./config'))
import { config } from './config'

// 期待 automock 的 getter 回傳原始值 → 實際是 undefined
expect(config.apiUrl).toBe('https://real.example.com')

// 期待能 restore automock 方法 → 無效
config.reload.mockRestore()
```

## ✅ Good

```ts
import { config } from './config'

// 要控制 getter，明確用 spyOn 的 'get' 模式
vi.spyOn(config, 'apiUrl', 'get').mockReturnValue('https://test.local')
expect(config.apiUrl).toBe('https://test.local')

// 改 prototype 實作會套用到所有實例
vi.mock(import('./Repository'))
import { Repository } from './Repository'
Repository.prototype.find.mockReturnValue([{ id: 1 }])

const repo = new Repository()
expect(repo.find()).toEqual([{ id: 1 }])
```

需要保留原始實作但加上 spy 時，用 `vi.mock(path, { spy: true })`，它的行為與 v3 一致。
