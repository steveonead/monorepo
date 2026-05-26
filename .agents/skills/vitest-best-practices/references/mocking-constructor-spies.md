---
rule: mocking-constructor-spies
category: Mock 與 Spy
tags: [mocking, spyOn, constructor, class, mockImplementation]
---

# Spy 建構式的實作要用 `function` 或 `class`

> v4 的 `vi.spyOn` 與 `vi.fn` 支援 `new` 呼叫，所以 `mockImplementation` 不能用 arrow function，arrow function 沒有 `[[Construct]]`，用 `new` 呼叫會拋 TypeError。要改用 `function` 或 `class`。

## 原因

- v3 對建構式 spy 會直接拋出 `Constructor requires 'new'`，v4 改成正確建構實例
- arrow function 沒有 `[[Construct]]`，用 `new` 呼叫必定失敗
- 用 `function` 時可透過 `this` 設定實例屬性，用 `class` 則語意最清楚

## ❌ Bad

```ts
const spy = vi.spyOn(cart, 'Apples').mockImplementation(() => ({
  getApples: () => 0,
}))

const apples = new spy() // TypeError: <anonymous> is not a constructor
```

## ✅ Good

```ts
// 用 class：語意最清楚
const spy = vi.spyOn(cart, 'Apples').mockImplementation(
  class MockApples {
    getApples() {
      return 0
    }
  },
)

const apples = new spy()
expect(apples.getApples()).toBe(0)
```

```ts
// 或用 function：透過 this 設定實例，TS 下要標註 this 型別
vi.spyOn(cart, 'Apples').mockImplementation(function (this: { getApples: () => number }) {
  this.getApples = () => 0
})
```
