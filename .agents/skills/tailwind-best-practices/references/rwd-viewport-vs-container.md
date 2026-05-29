---
rule: rwd-viewport-vs-container
category: RWD
tags: [rwd, container-query, viewport, breakpoint, responsive]
---

# Viewport breakpoint 管 page-level layout，container query 管可複用 component

> 判斷依據：component 會不會出現在不同寬度的 slot？會的話用 container query。

## 原因

- Viewport breakpoint 反映的是螢幕寬度，放在 sidebar 或 modal 內的 component 無法感知容器寬度。
- Container query 讓 component 根據父容器寬度自我調整，真正做到與位置無關的複用。
- 兩種機制混用沒問題，但邊界要清晰：全站決策走 viewport，組件內部自適應走 container。

## ❌ Bad

```tsx
{/* Card component 用 viewport breakpoint，放在 sidebar 時寬度不夠卻還是橫排 */}
<div className="flex flex-col md:flex-row gap-4">
  <img className="w-full md:w-32 rounded-md" />
  <div>Details</div>
</div>
```

這個 Card 在 768px 以上的螢幕一律橫排，但放在窄 sidebar 時版面會破版。

## ✅ Good

```tsx
{/* 全站 sidebar → viewport breakpoint */}
<aside className="hidden lg:block w-64">
  <Nav />
</aside>

{/* 可複用 Card → container query，無論放在哪個 slot 都能自適應 */}
<div className="@container">
  <div className="flex flex-col @md:flex-row gap-4">
    <img className="w-full @md:w-32 rounded-md" />
    <div>Details</div>
  </div>
</div>
```

Sidebar 的顯示與否由螢幕寬度決定，Card 的排列方向由容器寬度決定，職責分離。
