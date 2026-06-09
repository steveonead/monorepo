#!/usr/bin/env bash
INPUT=$(cat)

if [ "$(echo "$INPUT" | jq -r '.stop_hook_active')" = "true" ]; then
  exit 0
fi

# 兩邊皆可用：Claude Code 提供 CLAUDE_PROJECT_DIR；Codex 不提供，fallback 至 git root
PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(git rev-parse --show-toplevel 2>/dev/null)}"
[ -z "$PROJECT_DIR" ] && exit 0
cd "$PROJECT_DIR"

# 若無 TS/TSX 未提交變更（例如使用者取消並還原），跳過 typecheck
CHANGED_TS=$(git diff --name-only HEAD 2>/dev/null | grep -cE '\.(ts|tsx)$' || true)
if [ "$CHANGED_TS" -eq 0 ]; then
  exit 0
fi

RESULT=$(timeout 120 pnpm turbo typecheck 2>&1)
EXIT_CODE=$?

if [ $EXIT_CODE -eq 124 ]; then
  echo "typecheck timeout（超過 120 秒）" >&2
  exit 2
fi

if [ $EXIT_CODE -ne 0 ]; then
  echo "$RESULT" | tail -60 >&2
  exit 2
fi
exit 0
