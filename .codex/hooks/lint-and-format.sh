#!/usr/bin/env bash
INPUT=$(cat)
CWD=$(echo "$INPUT" | jq -r '.cwd // empty')

# Codex 透過 apply_patch 編輯檔案，tool_input 沒有 file_path，
# 檔案路徑藏在 patch 內文的 "*** Update/Add File:" 行（Delete 不需 lint）
PATCH=$(echo "$INPUT" | jq -r '.tool_input.command // empty')
[ -z "$PATCH" ] && exit 0

FILES=$(echo "$PATCH" | grep -oE '^\*\*\* (Update|Add) File: .+' | sed -E 's/^\*\*\* (Update|Add) File: //')
[ -z "$FILES" ] && exit 0

while IFS= read -r FILE; do
  [ -z "$FILE" ] && continue
  # apply_patch 路徑相對於 session cwd
  [[ "$FILE" = /* ]] || FILE="$CWD/$FILE"

  # 只處理 JS/TS 檔案
  [[ "$FILE" =~ \.(js|mjs|cjs|ts|mts|cts|jsx|tsx)$ ]] || continue
  [ -f "$FILE" ] || continue

  # 找最近的 package 根目錄（含 eslint.config.mjs 的目錄）
  # ESLint flat config 以 CWD 定位設定檔——必須 cd 到正確的 package 根目錄
  PKG_DIR=$(dirname "$FILE")
  while [ "$PKG_DIR" != "/" ]; do
    [ -f "$PKG_DIR/eslint.config.mjs" ] && break
    PKG_DIR=$(dirname "$PKG_DIR")
  done
  [ "$PKG_DIR" = "/" ] && continue

  # 從 package 根目錄執行，確保 flat config 正確解析
  # 先 eslint --fix（程式碼品質），再 prettier --write（格式化最終決定）
  cd "$PKG_DIR" && pnpm exec eslint --fix "$FILE" 2>/dev/null
  cd "$PKG_DIR" && pnpm exec prettier --write "$FILE" 2>/dev/null
done <<< "$FILES"

exit 0
