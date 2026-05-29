---
rule: hooks-custom-hook-extraction
category: Hooks 用法
tags: [custom-hook, reuse, abstraction]
---

# 同一組 stateful logic 超過一個元件時抽成 custom hook

> 重複的 useState 與相關 handler 封裝成以 use 開頭的 custom hook，讓邏輯可複用且可獨立測試。

## 原因

- 重複的 stateful logic 分散在多個元件時，一處修改容易漏改其他地方
- custom hook 可獨立測試，不需 render 元件
- hook 必須以 `use` 開頭，React 依此判斷 Rules of Hooks 是否適用

## ❌ Bad

```tsx
// 兩個元件各自複製同一組開關邏輯
function ComponentA() {
  const [isOpen, setIsOpen] = useState(false)
  const open = () => setIsOpen(true)
  const close = () => setIsOpen(false)

  return <Dialog open={isOpen} onOpen={open} onClose={close} />
}

function ComponentB() {
  const [isOpen, setIsOpen] = useState(false)
  const open = () => setIsOpen(true)
  const close = () => setIsOpen(false)

  return <Drawer open={isOpen} onOpen={open} onClose={close} />
}
```

邏輯重複，調整開關行為時需同時改兩處，容易漏改。

## ✅ Good

```tsx
function useDisclosure(initialOpen = false) {
  const [isOpen, setIsOpen] = useState(initialOpen)

  function open() {
    setIsOpen(true)
  }

  function close() {
    setIsOpen(false)
  }

  return { isOpen, open, close }
}

function ComponentA() {
  const { isOpen, open, close } = useDisclosure()
  return <Dialog open={isOpen} onOpen={open} onClose={close} />
}

function ComponentB() {
  const { isOpen, open, close } = useDisclosure()
  return <Drawer open={isOpen} onOpen={open} onClose={close} />
}
```

邏輯集中在 `useDisclosure`，元件只負責渲染，行為調整只需改一處。
