#!/usr/bin/env bash
# 兩邊皆可用，依來源取出要處理的檔案清單：
#   Claude Code Edit/Write → tool_input.file_path（單一絕對路徑）
#   Codex apply_patch       → tool_input.command（raw patch，解析 "*** Add/Update File:" 取路徑，可多檔）
INPUT=$(cat)

ROOT="${CLAUDE_PROJECT_DIR:-$(git rev-parse --show-toplevel 2>/dev/null)}"

# 先取 Claude 的 file_path；若無則解析 Codex apply_patch 的 patch 內容
FILES=$(printf '%s' "$INPUT" | jq -r '.tool_input.file_path // empty')
if [ -z "$FILES" ]; then
  PATCH=$(printf '%s' "$INPUT" | jq -r '.tool_input.command // empty')
  FILES=$(printf '%s\n' "$PATCH" \
    | grep -oE '^\*\*\* (Add|Update) File: .+' \
    | sed -E 's/^\*\*\* (Add|Update) File: //')
fi

[ -z "$FILES" ] && exit 0

printf '%s\n' "$FILES" | while IFS= read -r FILE; do
  [ -z "$FILE" ] && continue

  # 只處理 JS/TS 檔案
  [[ "$FILE" =~ \.(js|mjs|cjs|ts|mts|cts|jsx|tsx)$ ]] || continue

  # apply_patch 路徑為 repo 相對；補成絕對路徑（Claude 的 file_path 已是絕對）
  case "$FILE" in
    /*) ABS="$FILE" ;;
    *)  ABS="${ROOT:+$ROOT/}$FILE" ;;
  esac
  [ -f "$ABS" ] || continue

  # 找最近的 package 根目錄（含 eslint.config.mjs 的目錄）
  # ESLint flat config 以 CWD 定位設定檔——必須 cd 到正確的 package 根目錄
  PKG_DIR=$(dirname "$ABS")
  while [ "$PKG_DIR" != "/" ]; do
    [ -f "$PKG_DIR/eslint.config.mjs" ] && break
    PKG_DIR=$(dirname "$PKG_DIR")
  done
  [ "$PKG_DIR" = "/" ] && continue

  # 從 package 根目錄執行，確保 flat config 正確解析
  # 先 eslint --fix（程式碼品質），再 prettier --write（格式化最終決定）
  (cd "$PKG_DIR" && pnpm exec eslint --fix "$ABS" >/dev/null 2>&1)
  (cd "$PKG_DIR" && pnpm exec prettier --write "$ABS" >/dev/null 2>&1)
done

exit 0
