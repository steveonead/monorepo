# SuperDSP 2.0 Context

SuperDSP 2.0 為一 DSP 平台，可以提供內部使用者與外部使用者自行建立與操作數位廣告。

## 角色

**OneAD**：擁有 SuperDSP 2.0 這個產品的公司。在本產品中視為一個獨立的代理商。
_避免使用_：本公司、

**AOE**：OneAD 內部的廣告操作人員。

## 廣告建立

**Campaign Group（活動群組）**：Campaign 的選擇性分類容器，無獨立預算或走期。
_避免使用_：Group、Ad Group

**Campaign（廣告活動）**：持有預算上限與走期邊界的頂層容器，無自己的狀態。
_避免使用_：Ad Campaign、Flight

**Line Item / LI（投放項目）**：廣告的唯一投放操作實體，擁有完整狀態機、定向目標設定與素材包的綁定。
_避免使用_：Placement、Ad Order

**Creative Pack（素材包）**：廣告素材的容器，可包含一至多個 Creative，與 LI 多對多綁定。由外部系統匯入，本平台唯讀。
_避免使用_：Creative Package、Creative Bundle、Creative Set、Ad

**Creative（廣告素材）**：Creative Pack 底下的個別廣告素材。
_避免使用_：Ad、Asset、Banner、影片、Video

## LI 狀態

**Draft（草稿）**：LI 建立後的初始狀態，尚未啟用投放。可啟用、可封存、可軟刪除。
_避免使用_：新建、未發布

**Active（啟用中）**：正在投放的狀態。不可封存或刪除。
_避免使用_：運行中、投放中、running

**Paused（暫停）**：使用者主動暫停，可重新啟用或手動停刊。不可直接封存。
_避免使用_：停止、suspended

**Stop（停刊）**：使用者從 `paused` 手動觸發的投放終態。與 `completed` 語意相同，差異在於觸發方式為手動。
_避免使用_：停止、終止、cancel

**Completed（已完成）**：系統走期到期後自動收斂的投放終態。與 `stop` 語意相同，差異在於觸發方式為系統自動。
_避免使用_：完成、finish、end

## 資料操作

**Archived（封存）**：獨立於狀態，封存後預設不顯示於主列表，可查看與還原，封存後整個項目變成唯讀。
_避免使用_：刪除、hide、隱藏、Invisible

**Soft Delete（軟刪除）**：使用者視角永久消失且不可還原，但 DB 仍然保留記錄。與封存的差異。
_避免使用_：hard delete、真刪除、physical delete
