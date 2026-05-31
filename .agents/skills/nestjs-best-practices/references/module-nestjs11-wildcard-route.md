---
rule: module-nestjs11-wildcard-route
category: module-architecture
tags: [nestjs11, breaking-change, middleware, wildcard]
---

# NestJS 11 中 forRoutes('*') 須改為 forRoutes('*splat')

> NestJS 11 修改萬用字元路由匹配規則，`forRoutes('*')` 靜默不匹配任何路由，必須改用具名萬用字元 `forRoutes('*splat')`。

## 原因

- NestJS 11 底層升級至 path-to-regexp v8，此版本不再接受無名萬用字元 `*`，必須使用具名萬用字元如 `*splat`。
- `forRoutes('*')` 在 NestJS 11 中不會拋出錯誤，而是靜默不匹配任何路由，導致 middleware 看似正常掛載卻完全不執行，問題難以察覺。
- 此為 NestJS 11 的 breaking change，升版時必須全面檢查所有使用 `forRoutes('*')` 的 middleware 設定。

## ❌ Bad

```typescript
// NestJS 11 中靜默不匹配任何路由
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes('*')  // ❌ NestJS 11 中不會匹配任何路由
  }
}
```

`forRoutes('*')` 在 NestJS 11 中不拋錯，但 `LoggerMiddleware` 實際上不會在任何請求中執行。

## ✅ Good

```typescript
// 使用具名萬用字元
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes('*splat')  // ✅ NestJS 11 正確的全路由匹配寫法
  }
}
```

具名萬用字元 `*splat` 符合 path-to-regexp v8 規範，會正確匹配所有路由。

> 識別符名稱可自訂（如 *path、*wildcard），但官方文件以 *splat 為慣例，建議統一採用以降低對照文件時的認知負擔。

## 例外

- 若只需對特定路由套用 middleware，建議明確列出路由或使用 `RouteInfo` 物件，而非依賴萬用字元，可避免意外覆蓋到不該被攔截的路由。
- 升版前建議在測試環境以整合測試驗證所有 middleware 是否如預期觸發。
