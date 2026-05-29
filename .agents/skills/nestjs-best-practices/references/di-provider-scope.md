---
rule: di-provider-scope
category: dependency-injection
tags: [dependency-injection, scope, performance, request-context]
---

# 預設使用 singleton scope，謹慎使用 REQUEST scope

> 沒有 request-specific 狀態的 provider 一律用 DEFAULT scope。

## 原因

- DEFAULT scope 在應用程式生命週期內只建立一個實例，效能最佳，不會因請求量增加而產生大量物件。
- REQUEST scope 具有傳染性，當 REQUEST scope provider 被 singleton 依賴時，該 singleton 也會被提升為 REQUEST scope，造成難以預期的效能損耗。

## ❌ Bad

```typescript
@Injectable({ scope: Scope.REQUEST })
export class UserService {
  constructor(private readonly repo: UserRepository) {}

  // 沒有任何 request-specific 狀態，不需要 REQUEST scope
  async findAll() {
    return this.repo.findAll()
  }
}
```

每個請求都重建 `UserService`（以及其整條依賴鏈），卻沒有任何 request-specific 邏輯，白白消耗資源。

## ✅ Good

```typescript
// 多數情況：DEFAULT scope（singleton）
@Injectable()
export class UserService {
  constructor(private readonly repo: UserRepository) {}

  async findAll() {
    return this.repo.findAll()
  }
}

// 真正需要 request context 時才使用 REQUEST scope
@Injectable({ scope: Scope.REQUEST })
export class RequestContextService {
  constructor(@Inject(REQUEST) private readonly request: Request) {}

  getCurrentUserId() {
    return this.request.user?.id
  }
}
```

只在確實需要存取 request 物件的 provider 上標記 REQUEST scope，其餘保持 singleton。

## 例外

若整條依賴鏈都已是 REQUEST scope，且效能測試確認可接受，才可考慮在其他 provider 也使用 REQUEST scope。
