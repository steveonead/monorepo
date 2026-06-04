# CONTEXT.md 格式

## 結構

```md
# {Context 名稱}

{一到兩句話說明這個 context 是什麼，以及它存在的原因。}

## 通用語言

**Order（訂單）**:
{一到兩句話定義這個術語}
_避免使用_: Purchase, transaction, 採購, 交易

**Invoice（發票）**:
客戶收到貨品後寄出的付款請求。
_避免使用_: Bill, payment request, 帳單, 付款單

**Customer（客戶）**:
下訂單的個人或組織。
_避免使用_: Client, buyer, account, 買家, 帳戶
```

## 規則

- **態度明確。** 同一概念有多個說法時，選最好的那個，其他列在 `_避免使用_` 底下。
- **定義精簡。** 最多一到兩句話。定義它「是什麼」，不是它「做什麼」。
- **只寫當前事實，不保留歷史脈絡。** 定義只描述術語現在的意義，不記錄演變過程（如「取代 X」、「原本稱為 Y」、「改用 Z」）。歷史背景與決策理由屬於 ADR，不屬於術語定義。
- **只收錄這個 context 專屬的術語。** 通用的程式設計概念（timeout、error type、utility pattern）不屬於這裡，即使專案大量使用也一樣。加術語前先問自己：這個概念是這個 context 獨有的，還是通用的程式設計概念？只有前者才收錄。
- **有自然的分群時，用子標題分類。** 如果所有術語屬於同一個主題，直接列表即可。

## 單一 vs 多 context 專案

**單一 context（大多數專案）：** 一份放在 repo 根目錄的 `CONTEXT.md`。

**多個 context：** 在 repo 根目錄放一份 `CONTEXT-MAP.md`，列出各 context 的位置與彼此的關係：

```md
# Context Map

## Contexts

- [Ordering](./src/ordering/CONTEXT.md)，接收並追蹤客戶訂單
- [Billing](./src/billing/CONTEXT.md)，產生發票並處理付款
- [Fulfillment](./src/fulfillment/CONTEXT.md)，管理倉儲揀貨與出貨

## Relationships

- **Ordering → Fulfillment**：Ordering 發出 `OrderPlaced` 事件，Fulfillment 接收後開始揀貨
- **Fulfillment → Billing**：Fulfillment 發出 `ShipmentDispatched` 事件，Billing 接收後產生發票
- **Ordering ↔ Billing**：共用 `CustomerId` 與 `Money` 型別
```

Skill 會自動推斷應使用哪種結構：

- 若存在 `CONTEXT-MAP.md`，讀取它來找到各 context
- 若只有根目錄的 `CONTEXT.md`，視為單一 context
- 若兩者都不存在，第一個術語確立時再建立根目錄的 `CONTEXT.md`

有多個 context 時，從當前話題推斷對應的 context。若無法確定，直接詢問。
