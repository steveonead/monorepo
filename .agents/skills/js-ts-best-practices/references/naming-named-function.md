---
rule: naming-named-function
category: 命名與可讀性
tags: [naming, function, arrow]
---

# 具名函式用 `function`，callback 用 arrow

> 模組層級或可重用的函式用 `function` 宣告，callback 與一次性匿名函式用 arrow function。

## 原因

- `function` 宣告會 hoisting，可在定義前呼叫，適合模組層級的工具函式
- Arrow function 沒有自己的 `this`，用在 callback 時不會意外綁定 `this`
- 物件方法需要存取 `this` 時，必須用 method shorthand（`{ foo() {} }`），不需要 `this` 時 arrow function 同樣可接受（`{ foo: () => {} }`）

## ❌ Bad

```ts
// 模組層級函式用 arrow，失去 hoisting 與明確語意
const formatDate = (date: Date) => date.toISOString();

// 物件方法需要 this，卻用 arrow，導致 this 綁定錯誤
const timer = {
  count: 0,
  tick: () => {
    this.count++; // this 為 undefined（嚴格模式）
  },
};
```

Arrow function 在模組層級無法 hoisting，需要 `this` 的物件方法也不能用 arrow function。

## ✅ Good

```ts
// 模組層級函式用 function
function formatDate(date: Date): string {
  return date.toISOString();
}

// 物件方法需要 this → 用 method shorthand
const timer = {
  count: 0,
  tick() {
    this.count++; // this 正確指向 timer
  },
};

// 物件方法不需要 this → arrow 同樣可接受
const handlers = {
  onClick: () => console.log("clicked"),
  onHover: () => console.log("hovered"),
};

// callback 用 arrow
const dates = rawDates.map((dateStr) => new Date(dateStr));
```

`function` 宣告語意明確且支援 hoisting，需要 `this` 的方法用 method shorthand，不需要 `this` 時 arrow 與 method shorthand 皆可。
