---
rule: advanced-no-complex-types
category: 進階型別技巧
tags: [advanced, complexity, readability]
---

# 避免過度複雜的型別

> 高階型別技巧只在真正必要時使用，型別複雜到難以理解時優先簡化或拆解。

## 原因

- 巢狀 conditional type、deep recursive type 讓 TS 推斷變慢，IDE 反應遲鈍
- 型別難讀，review 和維護成本跟著升高
- 大多數複雜型別問題，重新設計資料結構就能解決

## ❌ Bad

```ts
// 過度複雜的 conditional + recursive type
type DeepNested<T> = T extends object
  ? { [K in keyof T]: T[K] extends infer U
      ? U extends object
        ? DeepNested<U>
        : U
      : never
    }
  : T;

// 難以理解的 template literal 組合
type EventName<T extends string> = `on${Capitalize<T>}`;
type AllEvents = EventName<"click" | "focus" | "blur" | "keydown" | "keyup">;
```

閱讀者需要反覆追蹤多層 `extends infer`，才能理解型別實際代表什麼，且 recursive type 可能讓 TypeScript 推斷顯著變慢。

## ✅ Good

```ts
// 直接用 utility type 組合，語意清晰
type Config = Readonly<{
  host: string;
  port: number;
}>;

// 必要時才引入高階型別，並加上說明
// 這個 type 解決了 TS 無法自動推斷 discriminated union exhaustive 的問題
type Expand<T> = T extends infer O ? { [K in keyof O]: O[K] } : never;
```

優先使用內建 utility type（`Readonly`、`Partial`、`Pick`、`Record`）組合，語意清晰且推斷快速。必須使用高階型別時，加上說明解釋為何需要它。
