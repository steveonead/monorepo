---
rule: safety-readonly
category: 型別安全
tags: [safety, readonly, immutability]
---

# 用 `Readonly`/`readonly` 在編譯期防修改

> 對不該被修改的資料用 `readonly`、`Readonly<T>` 或 `as const` 表達，零 runtime 成本。

## 原因

- `readonly` 在編譯期阻止意外修改，不增加任何 runtime 成本
- 明確標示不可變性，讓讀者和工具都知道這份資料不該被修改
- 函式參數標 `readonly` 可防止函式內部意外修改呼叫端的資料

## ❌ Bad

```ts
function sortUsers(users: User[]) {
  users.sort((a, b) => a.name.localeCompare(b.name)); // 意外修改了呼叫端的陣列
  return users;
}

type Config = { host: string; port: number };
function connect(config: Config) {
  config.host = "overridden"; // 可以修改，但不應該
}
```

`sort` 是 in-place 排序，呼叫端的原始陣列被靜默修改。`config.host` 被函式內部覆寫，呼叫端毫不知情。

## ✅ Good

```ts
function sortUsers(users: readonly User[]): User[] {
  return users.toSorted((a, b) => a.name.localeCompare(b.name));
  // users.sort(...); // TS 報錯：sort 不存在於 readonly array
}

function connect(config: Readonly<Config>) {
  // config.host = "overridden"; // TS 報錯
}
```

`readonly User[]` 讓 `sort` 在編譯期報錯，強迫改用 `toSorted` 回傳新陣列。`Readonly<Config>` 讓函式無法修改傳入的物件屬性。

## 例外

`Readonly<T>` 只保護第一層屬性（shallow），巢狀物件的屬性仍可修改。需要 deep immutability 時改用 `as const`（適用於編譯期已知的字面值），或自訂 `DeepReadonly<T>` utility type。
