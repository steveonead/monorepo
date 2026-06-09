#!/usr/bin/env bash
set -euo pipefail

# fail closed：jq 缺失時封鎖，避免 npm/yarn/bun 防護被靜默繞過
command -v jq >/dev/null 2>&1 || { echo "BLOCKED: jq 未安裝，套件管理器防護無法運作。請先安裝 jq。" >&2; exit 2; }

CMD=$(jq -r '.tool_input.command // ""')
[[ -z "$CMD" ]] && exit 0

# 封鎖 npm（npx 不受影響——"npx" 不匹配 "npm"）
if echo "$CMD" | grep -qE '(^|[;&|]\s*)\s*npm(\s|$)'; then
  echo "BLOCKED: 此專案使用 pnpm。請用 pnpm 取代 npm（例：pnpm install、pnpm run <script>）。npx 仍可使用。" >&2
  exit 2
fi

# 封鎖 yarn
if echo "$CMD" | grep -qE '(^|[;&|]\s*)\s*yarn(\s|$)'; then
  echo "BLOCKED: 此專案使用 pnpm。請用 pnpm 取代 yarn（例：pnpm install、pnpm run <script>）。" >&2
  exit 2
fi

# 封鎖 bun 與 bunx
if echo "$CMD" | grep -qE '(^|[;&|]\s*)\s*bunx?(\s|$)'; then
  echo "BLOCKED: 此專案使用 pnpm。請用 pnpm / npx 取代 bun/bunx（例：pnpm install、pnpm run <script>、npx <tool>）。" >&2
  exit 2
fi

exit 0
