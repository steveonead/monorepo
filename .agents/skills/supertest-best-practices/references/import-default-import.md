---
rule: import-default-import
category: Import
tags: [import, esmodule, typescript]
---

# 使用 default import

> 用 `import request from 'supertest'`，不用 `import * as request`

## 原因

- NestJS 預設開啟 `esModuleInterop: true`，此時 `import * as request` 的型別是 namespace object 而非可呼叫函式，執行時拋出 `request is not a function`

## ❌ Bad

```typescript
import * as request from 'supertest';
```

舊版 NestJS schematics 產生的寫法，在啟用 `esModuleInterop` 的環境下會報錯。

## ✅ Good

```typescript
import request from 'supertest';
```

`esModuleInterop: true` 讓 default import 正確對應 CJS 的 `module.exports`。
