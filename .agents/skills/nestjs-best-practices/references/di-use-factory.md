---
rule: di-use-factory
category: dependency-injection
tags: [dependency-injection, factory-provider, async-provider, initialization]
---

# 非同步初始化的 provider 使用 useFactory，不在建構子內執行 side effect

> 資料庫連線、外部服務 client 等需要非同步初始化的資源，應以 `useFactory` 在模組層做一次性初始化，不在 Service 建構子內執行。

## 原因

- 建構子（constructor）是同步的，在建構子內執行 `await` 需依賴框架的特殊處理，容易產生初始化時序問題。
- 若在 Service 建構子內呼叫非同步初始化，每次注入都可能重新建立連線，造成資源浪費或連線數爆增。
- `useFactory` 搭配 singleton scope，確保非同步資源只初始化一次，並可透過 `inject` 陣列乾淨地取得其他 provider（如 `ConfigService`），維持依賴關係的可測試性。

## ❌ Bad

```typescript
@Injectable()
export class DatabaseService {
  private connection: Connection

  constructor(private readonly config: ConfigService) {
    // ❌ 建構子不應執行非同步 side effect
    this.connection = await createConnection(config.get('DATABASE_URL'))
  }
}
```

建構子不能直接使用 `await`，必須另外處理初始化時序；若多個地方注入 `DatabaseService`，連線邏輯可能被重複觸發。

## ✅ Good

```typescript
export const DATABASE_CONNECTION = Symbol('DATABASE_CONNECTION')

// module 中以 useFactory 做一次性非同步初始化
{
  provide: DATABASE_CONNECTION,
  useFactory: async (config: ConfigService): Promise<Connection> => {
    return createConnection(config.get('DATABASE_URL'))
  },
  inject: [ConfigService],
}

// 使用端直接注入已初始化的 Connection
@Injectable()
export class UsersRepository {
  constructor(
    @Inject(DATABASE_CONNECTION) private readonly connection: Connection,
  ) {}

  async findById(id: string) {
    return this.connection.query('SELECT * FROM users WHERE id = $1', [id])
  }
}
```

`useFactory` 在模組啟動時執行一次，回傳的 `Connection` 以 singleton 形式共用。`inject` 陣列宣告依賴，保持可測試性。

## 例外

- 若初始化邏輯非常複雜，可將 factory 函式抽取成獨立的 `createXxxConnection` 函式放在同一模組旁，保持 module 檔案簡潔。
- 測試時以 `overrideProvider(DATABASE_CONNECTION).useValue(mockConnection)` 替換，無需啟動真實連線。
