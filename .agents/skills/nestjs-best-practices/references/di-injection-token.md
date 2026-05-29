---
rule: di-injection-token
category: dependency-injection
tags: [dependency-injection, injection-token, testability, decoupling]
---

# 用 InjectionToken 注入介面，讓測試可替換實作

> 以 Symbol token 搭配 type 宣告介面，讓 Service 與具體實作解耦。

## 原因

- 直接注入 class 實作會讓 Service 與資料層強耦合，測試時需啟動真實資料庫或複雜的 mock 設定。
- Symbol token 搭配 `overrideProvider` 可在測試中輕鬆替換任何實作，不需修改 Service 本身。

## ❌ Bad

```typescript
@Injectable()
export class UsersService {
  constructor(
    private readonly repo: PrismaUsersRepository,
  ) {}

  async findOne(id: string) {
    return this.repo.findById(id)
  }
}
```

Service 直接依賴 `PrismaUsersRepository`，測試必須啟動真實資料庫連線或對 Prisma 的內部方法進行 mock。

## ✅ Good

```typescript
export const USERS_REPO = Symbol('USERS_REPO')

export type UsersRepo = {
  findById: (id: string) => Promise<UserDto | null>
}

@Injectable()
export class UsersService {
  constructor(
    @Inject(USERS_REPO) private readonly repo: UsersRepo,
  ) {}

  async findOne(id: string) {
    return this.repo.findById(id)
  }
}

// module 中提供實作
// { provide: USERS_REPO, useClass: PrismaUsersRepository }

// 測試中替換實作
// .overrideProvider(USERS_REPO).useValue({ findById: vi.fn() })
```

Service 只依賴抽象的 `UsersRepo` type，測試時以任意物件替換，不需啟動資料庫。
