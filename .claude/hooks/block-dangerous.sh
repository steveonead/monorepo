#!/usr/bin/env bash
set -euo pipefail

CMD=$(jq -r '.tool_input.command // ""')
[[ -z "$CMD" ]] && exit 0

block() {
  echo "BLOCKED: $1" >&2
  exit 2
}

# === Filesystem ===

# rm with recursive + force (any flag order: -rf, -fr, -r -f, -Rf, --recursive --force...)
if echo "$CMD" | grep -qE '\brm\b' && \
   echo "$CMD" | grep -qE '\-[a-zA-Z]*[rR][a-zA-Z]*|--recursive' && \
   echo "$CMD" | grep -qE '\-[a-zA-Z]*f[a-zA-Z]*|--force'; then
  block "rm -rf 危險操作。請先用 ls 確認路徑後手動執行，或改用 trash-cli。"
fi

# dd directly writing to disk device
if echo "$CMD" | grep -qE '\bdd\b.*\bof=/dev/(sd|hd|nvme|vd|disk)[a-z0-9]'; then
  block "dd 直接寫入磁碟裝置，會永久覆寫所有資料。"
fi

# mkfs formatting
if echo "$CMD" | grep -qE '(^|\s)mkfs(\s|\.|$)'; then
  block "mkfs 格式化磁碟操作，會摧毀所有資料。"
fi

# Redirect to raw disk device (e.g. > /dev/sda)
if echo "$CMD" | grep -qE '>\s*/dev/(sd|hd|nvme|vd|disk)[a-z0-9]'; then
  block "直接對磁碟裝置重導向寫入，會毀損資料分割表。"
fi

# mv data into /dev/null (permanent data loss)
if echo "$CMD" | grep -qE '\bmv\b.*\s/dev/null(\s|$)'; then
  block "mv 到 /dev/null 會永久銷毀資料，不可復原。"
fi

# === Git ===

# git reset --hard (discards all uncommitted changes)
if echo "$CMD" | grep -qE 'git\s+reset\s+--hard'; then
  block "git reset --hard 會永久丟棄未提交變更。請先 git stash 保留修改。"
fi

# git push --force / -f (but NOT --force-with-lease which is safe)
if echo "$CMD" | grep -qE 'git\s+push\b' && echo "$CMD" | grep -qE '(\s--force\b|\s-f\b)'; then
  if ! echo "$CMD" | grep -qF -- '--force-with-lease'; then
    block "git push --force 可能覆寫他人提交。請改用 --force-with-lease。"
  fi
fi

# git clean -f (removes untracked files permanently)
if echo "$CMD" | grep -qE 'git\s+clean\b' && echo "$CMD" | grep -qE '\-[a-zA-Z]*f[a-zA-Z]*'; then
  block "git clean -f 會永久刪除 untracked 檔案。先用 git clean --dry-run 確認範圍。"
fi

# git checkout -- . (discard all working directory changes)
if echo "$CMD" | grep -qE 'git\s+checkout\s+--\s+\.'; then
  block "git checkout -- . 會丟棄所有工作目錄修改。請先 git stash 保留修改。"
fi

# === Database ===

# DROP TABLE / DROP DATABASE / TRUNCATE TABLE
if echo "$CMD" | grep -qiE '\b(DROP\s+(TABLE|DATABASE|SCHEMA|INDEX)|TRUNCATE\s+TABLE)\b'; then
  block "SQL 破壞性操作（DROP/TRUNCATE）。若確實需要，請手動連線資料庫執行。"
fi

# === System ===

# chmod/chown -R on root / or home ~
if echo "$CMD" | grep -qE '\bch(mod|own)\b' && echo "$CMD" | grep -qE '(-[a-zA-Z]*R[a-zA-Z]*|--recursive)'; then
  if echo "$CMD" | grep -qE '\s(/|~)\s*$|\s(/|~)\s+'; then
    block "chmod/chown -R 對根目錄或家目錄操作會破壞系統權限模型。"
  fi
fi

# kill -9 -1 (kills all processes)
if echo "$CMD" | grep -qE '\bkill\s+(-9|-KILL|-SIGKILL)\s+-1\b'; then
  block "kill -9 -1 會殺掉幾乎所有 process，導致系統不穩定或需強制重開機。"
fi

# Fork bomb :(){ :|:& };:
if echo "$CMD" | grep -qF ':(){'; then
  block "Fork bomb 偵測到，會耗盡所有系統資源。"
fi

# === Network ===

# curl/wget piped directly to shell (remote code execution risk)
if echo "$CMD" | grep -qE '(curl|wget)\b.*\|\s*(bash|sh|zsh|fish|dash)\b'; then
  block "curl/wget pipe 到 shell 有遠端代碼執行風險（RCE）。請先下載後檢查內容再手動執行。"
fi

exit 0
