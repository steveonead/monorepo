#!/usr/bin/env bash
INPUT=$(cat)

if [ "$(echo "$INPUT" | jq -r '.stop_hook_active')" = "true" ]; then
  exit 0
fi

cd "$CLAUDE_PROJECT_DIR"
RESULT=$(pnpm turbo typecheck 2>&1)
EXIT_CODE=$?

if [ $EXIT_CODE -ne 0 ]; then
  echo "$RESULT" | tail -60 >&2
  echo '{"decision": "block", "reason": "偵測到 TypeScript 型別錯誤（見上方輸出），請修正所有型別錯誤後再停止。"}'
fi
exit 0
