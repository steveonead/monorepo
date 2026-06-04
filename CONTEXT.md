# SuperDSP 2.0 Context

SuperDSP 2.0 為一 DSP 平台，可以提供內部使用者與外部使用者自行建立與操作數位廣告。

## 廣告建立

**Campaign Group（活動群組）**：Campaign 的選擇性分類容器。
_避免使用_：Group、Ad Group

**Campaign（廣告活動）**：廣告投放的頂層執行單位，設定行銷目標、走期與總預算上限，底下包含零至多個 Line Item。
_避免使用_：Ad Campaign、Flight

**Line Item（投放項目）**：廣告投放的執行單位，定義投放目標、走期、預算與素材包綁定。
_避免使用_：LI、Placement、Ad Order

**Creative Pack（素材包）**：廣告素材的容器，可包含一至多個 Creative，與 Line Item 多對多綁定。
_避免使用_：Creative Package、Creative Bundle、Creative Set

**Creative（廣告素材）**：Creative Pack 底下的個別廣告素材，可能為 Banner 或者 Video。
_避免使用_：Ad、Asset、Banner、影片、Video
