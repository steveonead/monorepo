---
rule: comp-clean-jsx-logic
category: 元件設計
tags: [jsx, readability, refactoring]
---

# JSX 不放過多邏輯判斷

> 複雜 filter/map chain 與含業務邏輯的 inline function 應抽離，保持 JSX 宣告式。

## 原因

- JSX 裡的邏輯無法獨立測試
- 複雜 chain 塞在 JSX 裡，渲染結構與業務邏輯難以分開閱讀
- inline handler 含業務邏輯時，每次 render 都重建函式 reference

## ❌ Bad

```tsx
type ProductListProps = {
  products: Product[]
  query: string
  minPrice: number
}

function ProductList({ products, query, minPrice }: ProductListProps) {
  return (
    <ul>
      {products
        .filter(product => product.name.includes(query) && product.price >= minPrice)
        .map(product => (
          <li
            key={product.id}
            onClick={() => {
              track('click')
              navigate(`/p/${product.id}`)
            }}
          >
            {product.name}
          </li>
        ))}
    </ul>
  )
}
```

filter/map chain 與業務邏輯直接塞在 JSX 裡，渲染結構、過濾邏輯、事件處理全部混在一起，難以各自測試或修改。

## ✅ Good

```tsx
type ProductListProps = {
  products: Product[]
  query: string
  minPrice: number
}

function ProductList({ products, query, minPrice }: ProductListProps) {
  const filtered = useFilteredProducts(products, query, minPrice)
  const handleClick = useCallback((id: string) => {
    track('click')
    navigate(`/p/${id}`)
  }, [])

  return (
    <ul>
      {filtered.map(product => (
        <li key={product.id} onClick={() => handleClick(product.id)}>
          {product.name}
        </li>
      ))}
    </ul>
  )
}
```

過濾邏輯移到 custom hook，事件處理抽成 named handler，JSX 只描述結構，三者可獨立測試。

判斷標準：

- `.map()` 回調超過 3 行 → 抽成獨立 component
- `.filter().map()` 鏈 → 抽成 derived value 或 custom hook
- inline function 含業務邏輯（非純 setter）→ 抽成 named handler
