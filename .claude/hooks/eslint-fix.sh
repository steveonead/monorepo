#!/usr/bin/env bash
INPUT=$(cat)
FILE=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

[ -z "$FILE" ] && exit 0

# Only process JS/TS files
[[ "$FILE" =~ \.(js|mjs|cjs|ts|mts|cts|jsx|tsx)$ ]] || exit 0

# Find nearest package root (dir with eslint.config.mjs)
# ESLint flat config uses CWD to locate config — must cd to correct package root
PKG_DIR=$(dirname "$FILE")
while [ "$PKG_DIR" != "/" ]; do
  [ -f "$PKG_DIR/eslint.config.mjs" ] && break
  PKG_DIR=$(dirname "$PKG_DIR")
done

[ "$PKG_DIR" = "/" ] && exit 0

# Run from package root so flat config resolves correctly
# eslint --fix first (code quality), prettier --write last (formatting has final say)
cd "$PKG_DIR" && pnpm exec eslint --fix "$FILE" 2>/dev/null
cd "$PKG_DIR" && pnpm exec prettier --write "$FILE" 2>/dev/null
exit 0
