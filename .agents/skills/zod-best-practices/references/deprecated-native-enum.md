---
rule: deprecated-native-enum
category: 廢棄 API
tags: [deprecated, enum, native-enum]
---

# 禁用 `z.nativeEnum()`，改用 `z.enum()`

> `z.nativeEnum()` 在 v4 deprecated，`z.enum()` 已原生支援相同需求；同時 `.Enum` / `.Values` 存取器已 REMOVED，統一改用 `.enum`。

## 原因

- `z.nativeEnum()` 已標記 deprecated，未來 major 版本將移除
- v4 的 `z.enum()` 支援 `as const` 物件，效果完全等同，且 js-ts-best-practices 禁用 TypeScript `enum`
- `Schema.Enum` 與 `Schema.Values` 在 v4 已 REMOVED，只保留 `Schema.enum`

## ❌ Bad

```ts
// TypeScript enum（js-ts-best-practices 禁用）搭配 z.nativeEnum()
enum Color {
  Red = "RED",
  Blue = "BLUE",
}

const ColorSchema = z.nativeEnum(Color); // deprecated

// v4 已 REMOVED，會 runtime error
console.log(ColorSchema.Enum.Red);   // ❌ REMOVED
console.log(ColorSchema.Values.Red); // ❌ REMOVED
```

`z.nativeEnum()` 已 deprecated；`.Enum` / `.Values` 在 v4 已直接移除，呼叫即報錯。

## ✅ Good

```ts
const Color = {
  Red: "RED",
  Blue: "BLUE",
} as const;

const ColorSchema = z.enum(["RED", "BLUE"]);
export type Color = z.infer<typeof ColorSchema>;

// v4 正確存取方式：只用 .enum
console.log(ColorSchema.enum.Red); // "RED"
```

`z.enum()` 搭配 `as const` 物件或字串陣列，完整取代 `z.nativeEnum()`；存取個別值統一用 `.enum`，不再有 `.Enum` / `.Values`。
