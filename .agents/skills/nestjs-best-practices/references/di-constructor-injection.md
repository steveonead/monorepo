---
rule: di-constructor-injection
category: dependency-injection
tags: [dependency-injection, constructor, testability]
---

# 以建構子注入宣告依賴

> 永遠用建構子注入，不用 property injection。

## 原因

- 建構子注入讓所有依賴在 class 定義時一目了然，不需讀完整個 class 才能了解依賴圖。
- Property injection 的依賴在測試時需要額外手動設定屬性，無法透過建構子直接傳入 mock。

## ❌ Bad

```typescript
@Injectable()
export class UsersService {
  @Inject(UsersRepository)
  private repo: UsersRepository
}
```

依賴藏在屬性宣告中，靜態分析工具無法可靠追蹤依賴鏈，測試時也需手動對 `service.repo` 賦值。

## ✅ Good

```typescript
@Injectable()
export class UsersService {
  constructor(private readonly repo: UsersRepository) {}
}
```

所有依賴集中在建構子，一眼可見，測試時直接傳入 mock 實例即可完成替換。
