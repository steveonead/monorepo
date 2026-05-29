---
rule: immutable-map-set
category: 不可變與純粹
tags: [immutability, map, set, data-structure]
---

# 用 `Map`/`Set` 取代物件/陣列模擬

> 鍵值對應用 `Map`，唯一集合用 `Set`，禁止用物件模擬 Map、用陣列模擬 Set。

## 原因

- `Map` 的 key 可以是任意型別（物件、函式），且保留插入順序，物件 key 只能是 string/Symbol
- `Set` 的 `has`、`add`、`delete` 均為 O(1)，陣列的 `includes` 是 O(n)
- `Map`/`Set` 有專屬的迭代介面（`entries`、`values`、`forEach`），語意比物件更清晰

## ❌ Bad

```ts
// 用物件模擬 Map
const cache: Record<string, unknown> = {};
cache[key] = value;
if (cache[key]) { /* ... */ }

// 用陣列模擬 Set
const seen: string[] = [];
if (!seen.includes(id)) seen.push(id);
```

物件的 key 只能是 string/Symbol，陣列的 `includes` 效能隨資料量增長下降。

## ✅ Good

```ts
// Map
const cache = new Map<string, unknown>();
cache.set(key, value);
if (cache.has(key)) { /* ... */ }

// Set
const seen = new Set<string>();
if (!seen.has(id)) seen.add(id);
```

`Map`/`Set` 提供語意清晰的 API，且查詢效能為 O(1)，不受資料量影響。
