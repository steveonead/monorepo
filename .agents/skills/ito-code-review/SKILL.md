---
name: ito-code-review
argument-hint: "<target-branch> | pr/<number> | <path-or-feature>"
description: 對 branch diff、GitHub PR 或指定路徑以三個平行 sub-agent（行為、結構、安全性）執行 code review，整合 stack 專屬 best practice 規則後輸出統整報告。適用於 PR 送出前 self-review、review 任何 PR、審查既有程式碼品質。不適用於純架構討論或尚未開始寫 code 的情境。
---

# ito-code-review

## 概覽

三種來源、三個平行 sub-agent，統一輸出報告。主 agent 負責來源判斷、stack 偵測、去重與嚴重度調整；三個 sub-agent 各自獨立審查，不互傳 context。

## 使用時機

- 送 PR 前想先 self-review
- 想 review 任何人的 PR（含他人 PR）
- 審查既有功能或路徑的程式碼品質（無 diff context）

**不應使用的情況：** 純架構討論、還沒開始寫 code 的規劃階段。

## 核心流程

### 步驟 1：判斷來源

無 argument 時展示以下 hint 後結束：

```
用法：
  /ito-code-review <target-branch>     # 目前 branch vs 指定 branch
  /ito-code-review pr/<number>         # 指定 GitHub PR（任何 PR 均可）
  /ito-code-review <path-or-feature>   # 靜態 review 指定資料夾或 feature

範例：
  /ito-code-review main
  /ito-code-review pr/42
  /ito-code-review src/features/auth
  /ito-code-review auth
```

有 argument 時依以下順序判斷，取第一個命中的規則：

1. 引數符合 `pr/<number>` 或 `#<number>` → **Source 2**（GitHub PR）
2. `git branch --list <arg>` 有結果 → **Source 1**（branch diff）
3. 其餘 → **Source 3**（靜態路徑或 feature）

**Source 1** 執行：

```bash
git diff <target-branch>...HEAD
```

若 diff 為空，回報「跟 `<target-branch>` 沒有差異，沒東西可以 review」並結束。

**Source 2** 執行：

```bash
gh pr diff <number>
```

同時取得 PR 標題供報告標頭使用。若 diff 為空，回報「PR #<number> 沒有差異，沒東西可以 review」並結束。

**Source 3** 確認範圍：

- `ls <arg>` 有結果 → 直接使用
- 模糊名稱 → 搜尋 codebase，列出候選清單，請使用者確認後繼續
- 超過 20 個檔案 → 警告並等待使用者縮小範圍或確認繼續

### 步驟 2：偵測 Stack

讀取 `docs/BEST-PRACTICE-MAP.md`，依 diff（Source 1、2）或目標路徑的副檔名與 import 語句記錄命中的 stack，立即讀取對應 best practice 文件。命中多個 stack 時全部納入。MAP.md 或 best practice 文件不存在時跳過，不報錯。

將命中的 best practice 規則整理後傳入步驟 3 各 sub-agent。

### 步驟 2.5：偵測新 Dependency（僅 Source 1、2）

若 diff 包含 `package.json`、`requirements.txt`、`go.mod`、`Cargo.toml`、`pyproject.toml`、`Gemfile` 等 package manager 檔案的變動，對每個新增 dependency 確認：

1. **必要性**：現有 stack 能解決嗎？有無更輕量替代？
2. **體積**：bundle 影響有多大？
3. **維護狀態**：近期 commit 頻率、open issues 是否合理？
4. **已知漏洞**：`npm audit` / `pip audit` / `cargo audit` / `bundle audit` 有無回報？
5. **授權**：授權是否與專案相容？

無 package manager 檔案變動時跳過本步驟。

### 步驟 3：三個平行 sub-agent

使用 Agent tool 同時啟動三個 sub-agent，各自獨立執行，不互傳 context。傳入的內容：diff 或目標路徑的程式碼、步驟 2 整理好的 best practice 規則。

每個 sub-agent 輸出以下 JSON schema：

```json
{
  "findings": [
    {
      "dimension": "行為 | 結構 | 安全性",
      "severity": "critical | minor | suggestion",
      "confidence": 3,
      "title": "問題標題",
      "description": "問題說明",
      "location": "file.ts:42",
      "suggestion": "修正方向（選填）"
    }
  ]
}
```

`confidence` 為 1–5 整數，5 為最高信心。

---

#### Sub-agent A：行為（正確性 + 效能）

讀取 `references/performance-checklist.md`，只跑跟 diff（或目標程式碼）相關的 section。

審查項目：

- 邏輯符合預期行為嗎？邊界條件顧到了嗎？（null、空陣列、零值、超大值）
- Error path 有處理嗎？不只是 happy path 走得通
- 有沒有 off-by-one、race condition、state 不一致的問題？
- **Source 1、2**：測試有覆蓋這次的改動嗎？測試在測行為，還是只測實作細節？
- **Source 3**：測試有覆蓋這段程式碼的主要行為嗎？
- 效能 checklist 中與目標程式碼相關的項目

---

#### Sub-agent B：結構（可讀性 + 架構）

審查項目：

- 命名夠清楚嗎？`data`、`result`、`temp` 這種沒有上下文的名字要特別注意
- 邏輯好追嗎？巢狀三元運算子、深層 callback 要特別注意
- 有沒有「聰明過頭」的寫法，其實可以更直接？
- 有沒有 dead code 殘留？包括 `_unused` 變數、`// removed` 的註解
- 新的 abstraction 有必要嗎？同一模式出現三次再抽，不要過早
- 有沒有跟現有 pattern 衝突？若引入新 pattern，理由夠充分嗎？
- 模組邊界清不清楚？有沒有不必要的 coupling？
- Dependency 方向對不對？有沒有循環依賴？
- 有沒有可以共用但重複寫的邏輯？

---

#### Sub-agent C：安全性

讀取 `references/security-checklist.md`，只跑跟 diff（或目標程式碼）相關的 section。

例如：沒有動 auth 邏輯就跳過 Authentication section，沒有處理外部輸入就跳過 Input Validation section。

---

### 步驟 4：主 agent 整合

收到三份 JSON 後：

1. **去重**：比對 location 和 description 相近的 finding，合併保留最相關面向的版本
2. **嚴重度調整**：依 confidence 分調整最終嚴重度（高 severity 但低 confidence 可降級或移除）；使用者只看最終嚴重度，不看 confidence 分
3. 輸出報告

### 步驟 5：輸出報告

**報告標頭：**

- Source 1：`<current-branch> → <target-branch>`
- Source 2：`PR #<number>（<title>）`
- Source 3：`<path-or-feature>`

**嚴重度：**

- 🔴 **[嚴重]**：必修，有 bug、安全漏洞或會讓系統掛掉
- 🟡 **[輕微]**：建議修，影響可維護性或有潛在風險
- 🔵 **[建議]**：風格偏好或微小改善，可直接忽略

格式範例：

```
## Code Review：<current-branch> → <target-branch>

#### 行為

🔴 [嚴重] Finding 標題

- 問題描述 A
- 問題描述 B
- 位置：file.ts:42

建議：修正方式說明
```

沒問題的面向直接跳過，不輸出「此面向無問題」之類的廢話。

### 步驟 6：審查結論與後續

有 🔴 [嚴重] 時輸出：

```
🚫 有 [嚴重] 問題需要先處理。要我現在修嗎？
```

使用者確認後，逐一用 Edit tool 修 [嚴重] 問題。

沒有 [嚴重] 直接結束，不輸出審查結論。

## 常見合理化藉口

| 合理化藉口 | 實際情況 |
|---|---|
| 「diff 看起來沒問題，快速帶過就好」 | 跳過 checklist 容易漏掉不明顯的安全或效能問題 |
| 「best practice 文件不存在，整個步驟跳過」 | 文件不存在時跳過沒問題，但三個 sub-agent 不能省 |
| 「沒 [嚴重] 就不用說什麼」 | 正確，審查結論只在有 [嚴重] 時輸出 |
| 「把整份 checklist 跑完比較保險」 | 不相關的項目是雜訊，只跑跟目標程式碼有關的 section |
| 「一個 finding 在多個面向都有關，要重複標記」 | 一個 finding 只歸一個最相關的面向，不重複標記 |
| 「Source 3 要問有沒有跟需求對不上的地方」 | Source 3 無 diff context，移除此項，改問測試是否覆蓋主要行為 |

## 警訊

- 輸出「此面向無問題」（沒問題就不輸出那個 section）
- 跑了跟目標程式碼完全無關的 checklist 項目
- 有 [嚴重] 卻沒輸出審查結論
- 沒 [嚴重] 卻輸出 🚫
- Source 3 卻問「有沒有跟需求對不上的地方」
- diff 有 package manager 檔案變動但跳過步驟 2.5
- 三個 sub-agent 互傳 context 或合併成一個執行
- 沒有去重就直接輸出三份 JSON 的所有 finding
- confidence 分出現在使用者看到的報告中

## 驗證

- [ ] 來源判斷順序正確：`pr/<number>` → branch 比對 → 路徑
- [ ] Source 1、2：diff 非空才繼續
- [ ] Source 3：路徑有效或已請使用者確認；超過 20 個檔案已警告
- [ ] 步驟 2 已讀取 `docs/BEST-PRACTICE-MAP.md` 並載入對應 best practice 規則
- [ ] Source 1、2：有 package manager 檔案變動時，新 dependency 已逐一確認五項
- [ ] 三個 sub-agent 已平行啟動，各自獨立
- [ ] Sub-agent A、C 的 checklist 只跑跟目標程式碼相關的 section
- [ ] 主 agent 已去重並依 confidence 調整嚴重度
- [ ] 報告標頭格式符合對應 source
- [ ] 有 [嚴重] 才輸出 🚫 審查結論
- [ ] 使用者確認要修時，已用 Edit tool 實際修改對應行

## 延伸參考

- `references/security-checklist.md`：安全性 sub-agent 讀取，只取相關 section
- `references/performance-checklist.md`：行為 sub-agent 讀取，只取相關 section
- `docs/BEST-PRACTICE-MAP.md`：stack 偵測與 best practice 對照表，步驟 2 讀取
