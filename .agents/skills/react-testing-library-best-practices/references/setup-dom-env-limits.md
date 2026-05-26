---
rule: setup-dom-env-limits
category: 安裝與環境設定
tags: [setup, jsdom, happy-dom, limitations]
---

# jsdom / happy-dom 不支援 layout 與 observer

> jsdom 與 happy-dom 不是真實瀏覽器，沒有 layout、computed style 計算結果與 observer，這類行為要 stub 或移到 E2E。

## 原因

- `getComputedStyle` 回傳的是宣告值不是算出來的版面結果，`offsetWidth` / `offsetHeight` / `getBoundingClientRect` 多半是 0。
- `IntersectionObserver`、`ResizeObserver`、`matchMedia` 預設不存在或不完整，元件用到會拋出錯誤。
- 視覺、版面、真實 focus / drag 這類本來就該交給 browser mode 或 E2E，在模擬器強行測試只會得到不可靠的結果。

## ❌ Bad

```ts
test('卡片在小螢幕收合', () => {
  render(<Card />)
  // 模擬器沒有真正的 layout，offsetWidth 是 0
  expect(screen.getByTestId('card').offsetWidth).toBeLessThan(300)
})
```

斷言依賴模擬器算不出來的版面值，結果失真。

## ✅ Good

```ts
// 元件用到 IntersectionObserver 時，先在 setup 補 stub
beforeEach(() => {
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  )
})

test('進入可視範圍後載入更多', async () => {
  render(<InfiniteList />)
  // 測「行為」：載入後是否多出項目，而非真實捲動或版面
  expect(await screen.findByText(/第 2 頁/)).toBeInTheDocument()
})
```

驗證行為而非版面。真要測版面或視覺，把那幾個測試移到 browser mode。
