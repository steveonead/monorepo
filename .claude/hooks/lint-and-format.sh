#!/usr/bin/env bash
INPUT=$(cat)
FILE=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

[ -z "$FILE" ] && exit 0

# 只處理 JS/TS 檔案
[[ "$FILE" =~ \.(js|mjs|cjs|ts|mts|cts|jsx|tsx)$ ]] || exit 0

# 找最近的 package 根目錄（含 eslint.config.mjs 的目錄）
# ESLint flat config 以 CWD 定位設定檔——必須 cd 到正確的 package 根目錄
PKG_DIR=$(dirname "$FILE")
while [ "$PKG_DIR" != "/" ]; do
  [ -f "$PKG_DIR/eslint.config.mjs" ] && break
  PKG_DIR=$(dirname "$PKG_DIR")
done

[ "$PKG_DIR" = "/" ] && exit 0

# 從 package 根目錄執行，確保 flat config 正確解析
# 先 eslint --fix（程式碼品質），再 prettier --write（格式化最終決定）
cd "$PKG_DIR" && pnpm exec eslint --fix "$FILE" 2>/dev/null
cd "$PKG_DIR" && pnpm exec prettier --write "$FILE" 2>/dev/null
exit 0
