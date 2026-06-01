#!/usr/bin/env bash
INPUT=$(cat)

# 已被 Stop hook 續跑過就放行，避免無限循環
if [ "$(echo "$INPUT" | jq -r '.stop_hook_active')" = "true" ]; then
  exit 0
fi

# Codex 無 $CLAUDE_PROJECT_DIR，改用 git root（turbo 需在 repo root 執行）
CWD=$(echo "$INPUT" | jq -r '.cwd')
ROOT=$(cd "$CWD" 2>/dev/null && git rev-parse --show-toplevel 2>/dev/null)
[ -z "$ROOT" ] && ROOT="$CWD"
cd "$ROOT" || exit 0

# 若無 TS/TSX 未提交變更（例如使用者取消並還原），跳過 typecheck
CHANGED_TS=$(git diff --name-only HEAD 2>/dev/null | grep -cE '\.(ts|tsx)$' || echo 0)
if [ "$CHANGED_TS" -eq 0 ]; then
  exit 0
fi

RESULT=$(pnpm turbo typecheck 2>&1)
EXIT_CODE=$?

if [ $EXIT_CODE -ne 0 ]; then
  echo "$RESULT" | tail -60 >&2
  exit 2
fi
exit 0
