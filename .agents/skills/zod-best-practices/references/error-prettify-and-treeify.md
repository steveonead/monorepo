---
rule: error-prettify-and-treeify
category: 錯誤處理
tags: [error, formatting, prettify, treeify, v4]
---

# 錯誤格式化：prettifyError 顯示訊息、treeifyError 對應表單欄位

> Zod 4 內建錯誤格式化工具，不必再依賴 `zod-validation-error` 等外部套件。給使用者看的訊息用 `z.prettifyError()`，表單欄位錯誤用 `z.treeifyError()`。

## 原因

- `z.prettifyError()` 直接產出可讀字串，適合 CLI、log、開發者 toast
- `z.treeifyError()` 把 issue 依 `path` 收斂成嵌套物件，正好對應表單結構
- 自己 reduce `issues` 容易遺漏 nested array、union path 等邊界

## ❌ Bad

```ts
import { z } from "zod";

const result = Schema.safeParse(input);
if (!result.success) {
  const msg = result.error.issues
    .map((i) => `${i.path.join(".")}: ${i.message}`)
    .join("\n");
  console.log(msg);

  const flat = result.error.flatten();
  setFormErrors(flat.fieldErrors);
}
```

自製格式化沒處理 union / array path；`flatten()` / `format()` 在 v4 已 deprecate，且對嵌套物件覆蓋不完整。

## ✅ Good

```ts
import { z } from "zod";

const result = Schema.safeParse(input);
if (!result.success) {
  console.log(z.prettifyError(result.error));

  const tree = z.treeifyError(result.error);
  setFormErrors(tree);
}
```

`treeifyError()` 對應的型別結構與原 schema 同形：

```ts
const UserSchema = z.object({
  profile: z.object({ name: z.string().min(1) }),
  tags: z.array(z.string()),
});

const tree = z.treeifyError(error);
tree.properties?.profile?.properties?.name?.errors;
tree.properties?.tags?.items?.[0]?.errors;
```

## 例外

簡單 CLI、只有單一欄位的驗證、效能極端敏感的 hot path，可以直接遍歷 `issues`，省掉格式化開銷。遍歷時記得涵蓋全部 issue 而非只取第一個，見 `parse-handle-all-issues`。
