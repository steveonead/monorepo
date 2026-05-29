---
rule: type-satisfies
category: 型別設計
tags: [types, satisfies, inference]
---

# 需檢查又想保留推斷時用 `satisfies`

> 要驗證物件符合某個型別、又想保留實際內容的精確推斷時，用 `satisfies` 而非型別標註 `:`。（TypeScript 4.9+）

## 原因

- 型別標註 `:` 會把型別擴展到標註的型別，失去更精確的 literal 推斷
- `satisfies` 在驗證型別的同時，保留原本更精確的推斷結果

## ❌ Bad

```ts
type Config = Record<string, string | string[]>;

const config: Config = {
  host: "localhost",
  ports: ["3000", "8080"],
};

config.host.toUpperCase(); // TS 報錯：config.host 型別是 string | string[]，不確定有 toUpperCase
```

型別標註 `: Config` 讓每個屬性的型別都被擴展為 `string | string[]`，失去具體屬性是 `string` 還是 `string[]` 的資訊。

## ✅ Good

```ts
type Config = Record<string, string | string[]>;

const config = {
  host: "localhost",
  ports: ["3000", "8080"],
} satisfies Config;

config.host.toUpperCase(); // ✅ TS 推斷 config.host 為 string
config.ports.join(", "); // ✅ TS 推斷 config.ports 為 string[]
```

`satisfies` 驗證物件符合 `Config`，同時保留每個屬性的精確型別，讓存取時有完整的型別保護。
