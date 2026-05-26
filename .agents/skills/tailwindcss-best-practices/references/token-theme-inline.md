---
rule: token-theme-inline
category: Design Tokens
tags: [token, theme-inline, dark-mode, runtime]
---

# @theme inline 固化值，執行期主題切換會失效

> `@theme inline {}` 會在 build time 把 token 的值直接內聯進每個 utility，不保留 CSS 變數參照。若要靠改寫 token 變數本身（如改 `--color-surface`）來做執行期切換（dark mode、主題切換），用 `@theme inline` 會讓切換失效，這種 token 用一般 `@theme`。

## 原因

- 一般 `@theme` 讓 utility 透過 `var(--token)` 參照變數，改寫變數即可即時切換主題
- `@theme inline` 把值寫死進 utility，例如 `bg-surface` 直接變成 `background: #fff`，之後再改 `--color-surface` 變數也不會影響已生成的 utility
- 混用時容易誤判：明明改了變數畫面卻不變，排查成本高

## ❌ Bad

```css
/* 想靠改寫 --color-surface 切 dark mode，卻用 inline 固化成字面值 */
@theme inline {
  --color-surface: white;
}

.dark {
  --color-surface: black; /* bg-surface 已固化成 white，改不動 */
}
```

## ✅ Good

```css
/* 用一般 @theme，utility 透過 var(--color-surface) 參照，改寫即時切換 */
@theme {
  --color-surface: white;
}

.dark {
  --color-surface: black; /* bg-surface 跟著 --color-surface 切換 */
}
```

## 例外

token 參照另一個變數時（`--color-surface: var(--app-bg)`），反而該用 `@theme inline`，改切被參照的 `--app-bg`。否則 `var()` 在 `:root` 解析，子層才定義的值會失效：

```css
:root { --app-bg: white; }
.dark { --app-bg: black; }

@theme inline {
  --color-surface: var(--app-bg); /* bg-surface 跟著 --app-bg 切換 */
}
```

token 值永遠不變時，inline 也能省一層間接、輸出更精簡。
