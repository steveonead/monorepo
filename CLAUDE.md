## Linting & Formatting & Typecheck

- 由 PostToolUse hook 接手 Linting & Formatting，每次 Write/Edit 後自動執行。**不需手動呼叫 `eslint --fix` 或 `prettier`**
- 由 Stop hook 接手 Typecheck，每次回應結束前自動執行。有型別錯誤則 block 並顯示輸出。**不需手動呼叫 `tsc`**

@AGENTS.md
