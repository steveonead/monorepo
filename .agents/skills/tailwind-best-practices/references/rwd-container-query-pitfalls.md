---
rule: rwd-container-query-pitfalls
category: RWD
tags: [rwd, container-query, pitfalls, named-container, debugging]
---

# Container query 有三個常見陷阱

> `@container` 不觸發時，先確認容器有可量測寬度、使用的是 `@` 前綴 variant、以及是否需要 named container。

## 原因

- Container query 依賴容器的計算寬度，容器無明確寬度時 query 永遠不觸發。
- `@md:` 與 `md:` 外觀相似，混用不會報錯，行為卻完全不同。
- 巢狀容器需要指向特定祖先時，匿名容器無法滿足需求。

## 陷阱 1：`@container` 父元素無可量測寬度

```tsx
{/* ❌ flex column 內的 @container 無明確寬度，CQ 不觸發 */}
<div className="flex flex-col">
  <div className="@container">
    <div className="@md:flex-row">{/* 永遠不會套用 */}</div>
  </div>
</div>

{/* ✅ 確保父元素有寬度 */}
<div className="flex flex-col">
  <div className="@container w-full">
    <div className="@md:flex-row">內容</div>
  </div>
</div>
```

`@container` 本身也是一個 block，在 flex column 內預設 `width: auto`，需要明確加 `w-full` 或其他寬度 class。

## 陷阱 2：`@md:` 與 `md:` 混淆

```tsx
{/* ❌ 誤用 viewport breakpoint，跟容器寬度無關 */}
<div className="@container">
  <div className="md:flex-row">{/* 跟著 viewport 變，不是容器 */}</div>
</div>

{/* ✅ 在 @container 內使用 @ 前綴 */}
<div className="@container">
  <div className="@md:flex-row">正確</div>
</div>
```

`md:` 在 `@container` 內仍然是 viewport query，不會感知容器寬度。

## 陷阱 3：需指向特定祖先時用 named container

```tsx
{/* ✅ named container 語法：/ 後接容器名稱 */}
<div className="@container/card w-full">
  <div className="@container/inner">
    <p className="@sm/card:text-lg">{/* 指向外層 card，不是 inner */}</p>
  </div>
</div>
```

巢狀 `@container` 時，匿名的 container query 預設指向最近的祖先容器。若需指向更外層的容器，用 `/name` 語法為容器命名，再在 variant 後加 `/name` 指向它。
