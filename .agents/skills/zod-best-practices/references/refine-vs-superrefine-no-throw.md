---
rule: refine-vs-superrefine-no-throw
category: Refine 與 Transform
tags: [refine, superRefine, error]
---

# 多重錯誤用 `.superRefine()`；refine 內 return false 不 throw

> 只需要 yes / no 判斷時用 `.refine()`，且回傳 boolean 不 throw。需要報多個錯誤、客製 issue code 或定位到子欄位時用 `.superRefine()`。

## 原因

- `.refine()` 內 throw 會直接中斷整個驗證，後面 issue 收集不到
- `.refine()` 一次只能產生一個 issue；複雜情境用它會擠不出多個錯誤
- `.superRefine()` 透過 `ctx.addIssue()` 累積多個錯誤，並能指定 `path`；更低階的 `.check()` 用 `ctx.issues.push()`，兩者是不同 API

## ❌ Bad

```ts
import { z } from "zod";

const Password = z.string().refine((val) => {
  if (val.length < 8) throw new Error("太短");
  if (!/[A-Z]/.test(val)) throw new Error("需要大寫");
  return true;
});
```

第一個條件就 throw，後面的 issue 完全收集不到，使用者一次只看得到一個錯誤。

## ✅ Good

```ts
import { z } from "zod";

const Password = z.string().superRefine((password, ctx) => {
  if (password.length < 8) {
    ctx.addIssue({ code: "custom", message: "至少 8 個字元" });
  }
  if (!/[A-Z]/.test(password)) {
    ctx.addIssue({ code: "custom", message: "需要至少一個大寫" });
  }
});

const Age = z.number().refine((age) => age >= 18, {
  error: "需要年滿 18 歲",
});
```

判斷準則：
- 單一條件、單一錯誤訊息 → `.refine()`，回傳 boolean
- 多個獨立規則 → `.superRefine()`，用 `ctx.addIssue()`

需要把錯誤定位到特定子欄位（例如密碼確認）時記得帶 `path`，詳見 `refine-add-path`。

註：`.refine()` 的訊息參數用 `error`，`ctx.addIssue()` 的 issue 物件則用 `message`，兩者是不同層級的 API。

## 例外

確實只想中斷後續驗證（例如資源確實無法取得）才用 `ctx.addIssue({ fatal: true })` 加 `return z.NEVER`，不要直接 throw。
