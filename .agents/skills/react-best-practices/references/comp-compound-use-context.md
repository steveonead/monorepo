---
rule: comp-compound-use-context
category: 元件設計
tags: [compound-component, context, react19]
---

# Compound component 搭配 use() 共享 context

> 複雜元件拆為多個子元件，透過 context 共享狀態，不做 prop drilling。

## 原因

- Prop drilling 使中間層元件被迫傳遞它不需要的 props
- context 讓子元件按需讀取，可替換不同 Provider
- React 19 的 `use(Context)` 可條件式呼叫，比 `useContext` 更靈活

## ❌ Bad

```tsx
type ComposerProps = {
  submit: () => void
  isLoading: boolean
  onClose: () => void
  channelId: string
}

function Composer({ submit, isLoading, onClose, channelId }: ComposerProps) {
  return (
    <ComposerFrame onClose={onClose}>
      <ComposerInput channelId={channelId} />
      <ComposerFooter isLoading={isLoading} submit={submit} />
    </ComposerFrame>
  )
}
```

所有狀態集中在頂層，中間層元件被迫傳遞它們不需要的 props，新增需求時所有層都需同步修改。

## ✅ Good

```tsx
type ComposerContextValue = {
  state: ComposerState
  actions: ComposerActions
}

const ComposerContext = createContext<ComposerContextValue | null>(null)

type ProviderProps = {
  children: React.ReactNode
  state: ComposerState
  actions: ComposerActions
}

function ComposerProvider({ children, state, actions }: ProviderProps) {
  return (
    <ComposerContext value={{ state, actions }}>
      {children}
    </ComposerContext>
  )
}

function ComposerSubmit() {
  const { actions: { submit } } = use(ComposerContext) // React 19：可條件呼叫
  return <button onClick={submit}>Send</button>
}

export const Composer = {
  Provider: ComposerProvider,
  Frame: ComposerFrame,
  Input: ComposerInput,
  Submit: ComposerSubmit,
}
```

子元件透過 `use(ComposerContext)` 按需取用狀態，中間層不需傳遞任何 prop，擴充新子元件時只需讀取 context。
