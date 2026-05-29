---
rule: cov-v8-ignore
category: Coverage
tags: [coverage, v8, ignore, typescript]
---

# Coverage ignore 使用 v8 語法，TypeScript 加 @preserve

> v4 預設使用 v8 provider，ignore comment 必須用 `/* v8 ignore ... */`；TypeScript 專案需加 `-- @preserve` 防止 esbuild 清除 comment。

## 原因

- istanbul ignore comment 只對 istanbul provider 有效，使用 v8 provider 時無效
- TypeScript 專案透過 esbuild 轉譯時，一般 comment 會被 strip，加 `-- @preserve` 才能保留到執行期

## ❌ Bad

```ts
/* istanbul ignore next */
if (process.env.NODE_ENV === 'test') {
  overrideConfig()
}
```

```ts
/* v8 ignore next */
if (process.env.NODE_ENV === 'test') {
  overrideConfig()
}
// TypeScript 專案中 esbuild 會清除這個 comment，ignore 靜默失效
```

## ✅ Good

```ts
/* v8 ignore next -- @preserve */
if (process.env.NODE_ENV === 'test') {
  overrideConfig()
}
```

`-- @preserve` 標記讓 esbuild 保留這個 comment，v8 coverage 在執行期正確讀到 ignore 指令。

## 例外

純 JavaScript 專案（不經 esbuild 轉譯）可省略 `-- @preserve`，只用 `/* v8 ignore next */` 即可。
