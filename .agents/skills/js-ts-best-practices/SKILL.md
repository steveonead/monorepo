---
name: js-ts-best-practices
description: JavaScript/TypeScript 最佳實踐規則集，供撰寫、審查或重構 JS/TS 程式碼時參考。適用於撰寫新程式碼、code review、重構現有邏輯。不適用於框架層（React、NestJS 等有各自專屬規則集）。
---

# JavaScript / TypeScript Best Practices

涵蓋命名、控制流程、不可變性、模組系統、型別設計與型別安全。

## 適用時機

參考這份規則集的時機：
- 撰寫新的 JS/TS 程式碼
- 審查現有程式碼的品質
- 重構或最佳化現有程式碼

## 規則分類

| 分類 | 前綴 |
|------|------|
| 命名與可讀性 | `naming-` |
| 控制流程 | `flow-` |
| 不可變與純粹 | `immutable-` |
| 模組系統 | `module-` |
| 型別設計 | `type-` |
| 型別安全 | `safety-` |
| 進階型別技巧 | `advanced-` |

## 規則速查

### 命名與可讀性

- `naming-named-function` — 具名函式用 `function`，callback 用 arrow，物件方法用 method shorthand
- `naming-callback-param` — Callback 參數禁用單字母或縮寫，一律給完整語意名稱
- `naming-magic-value` — 有業務意義或會重複使用的數字、字串抽成具名常數

### 控制流程

- `flow-early-return` — 邊界條件先處理並 return，主邏輯維持在最外層，禁深層巢狀
- `flow-lookup-table` — 輸入對應輸出的查表邏輯，用 `Record`/`Map` 取代 `if-else`/`switch`
- `flow-nullish-coalescing` — 用 `?.` 存取可選屬性，用 `??` 提供預設值，禁止 `||`
- `flow-options-object` — 函式參數超過三個，改用單一 options 物件
- `flow-no-silent-fail` — 錯誤一律明確處理，禁止空 `catch`
- `flow-parallel-async` — 互不相依的 async 操作用 `Promise.all` / `Promise.allSettled` 平行執行

### 不可變與純粹

- `immutable-array-methods` — 陣列操作優先用 `map`/`filter`/`toSorted`/`toReversed`/`toSpliced`/`with`，禁止修改原陣列
- `immutable-pure-utility` — Utility function 一律寫成純函式，不依賴外部狀態
- `immutable-map-set` — 鍵值對應用 `Map`，唯一集合用 `Set`，禁止用物件/陣列模擬
- `immutable-deep-clone` — 深層複製用 `structuredClone`，含 Function/class instance 時改用 `cloneDeep`

### 模組系統

- `module-named-export` — 模組一律用 named export，禁止 `export default`
- `module-no-barrel` — 預設不建立 barrel `index.ts`，`export *` 全面禁止

### 型別設計

- `type-precise-types` — 用 literal union、tuple、branded type 取代 `string`/`number`/`any[]`
- `type-no-enum` — 禁用 `enum`，改用 `as const` 物件加 union type 推導
- `type-utility-types` — 從既有 type 衍生時用 `Omit`/`Pick`/`Partial`/`Record`/`ReturnType`
- `type-discriminated-union` — 互斥狀態用 discriminator union type，配合 `never` 做 exhaustive check
- `type-satisfies` — 需驗證型別又想保留精確推斷時，用 `satisfies`（TS 4.9+）
- `type-infer-no-redundant` — TS 能推斷的就不標註，標註只用在公開 API 契約等情境
- `type-no-any` — 型別未知時用 `unknown` 而非 `any`，強制先 narrowing 才存取
- `type-prefer-type-alias` — 物件型別一律用 `type` 宣告，禁止 `interface`

### 型別安全

- `safety-no-type-assertion` — 禁止 `as` 斷言，優先用 `typeof`/`instanceof`/`in` 或 type guard
- `safety-readonly` — 不該被修改的資料用 `readonly`/`Readonly<T>` 標示（注意：shallow-only）
- `safety-generic-constraint` — 泛型參數一律用 `extends` 限制形狀，禁止裸 `<T>` 存取屬性
- `safety-schema-validator` — 系統邊界的外部輸入一律用 Zod/Valibot 解析，優先 `safeParse`

### 進階型別技巧

- `advanced-type-guard` — 重複的型別收窄邏輯封裝成自訂 type guard（`v is X`）
- `advanced-assertion-function` — 驗證失敗就拋例外的場景用 assertion function（`asserts v is X`）
- `advanced-no-complex-types` — 高階型別技巧只在真正必要時使用，難以理解時優先簡化

## 使用方式

讀取個別規則檔案以取得詳細說明與範例：

```
references/[類別前綴]-[規則名稱].md
```

每個規則檔案包含：
- 說明此規則重要的原因
- 不建議的寫法（含說明）
- 建議的寫法（含說明）
- 例外情境（如有白名單）
