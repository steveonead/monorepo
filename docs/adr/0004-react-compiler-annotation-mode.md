# React Compiler 採用 annotation mode

React 19 引入 React Compiler 可自動最佳化 component re-render。採用 `annotation` mode 而非 `all` mode：

- `all` mode 目前穩定性不足
- `annotation` mode 讓團隊以 `'use memo'` directive 明確控制哪些 component 進入編譯器最佳化，降低非預期行為的風險

## 後果

- 新 component 預設不受 React Compiler 最佳化
- 需手動加 `'use memo'` 才會 opt-in
