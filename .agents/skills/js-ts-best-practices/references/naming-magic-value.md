---
rule: naming-magic-value
category: 命名與可讀性
tags: [naming, constant, readability]
---

# 消除魔術數字與字串

> 有業務意義或會重複使用的數字、字串抽成具名常數，禁止散落在程式碼中。

## 原因

- 直接寫數字或字串看不出業務意義，增加讀者理解成本
- 值需要修改時，散落各處的魔術值容易漏改

## ❌ Bad

```ts
if (user.age >= 18) {
  applyDiscount(price * 0.9);
}
setTimeout(refresh, 30000);
```

`18`、`0.9`、`30000` 看不出業務意義，`30000` 究竟是毫秒還是秒需要靠猜測。

## ✅ Good

```ts
const ADULT_AGE = 18;
const MEMBER_DISCOUNT_RATE = 0.9;
const REFRESH_INTERVAL_MS = 30_000;

if (user.age >= ADULT_AGE) {
  applyDiscount(price * MEMBER_DISCOUNT_RATE);
}
setTimeout(refresh, REFRESH_INTERVAL_MS);
```

具名常數讓業務意義自文件化，`_` 分隔符讓大數字更易讀，修改時只需改一處。
