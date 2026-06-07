# SuperDSP 2.0 — Phase 0 開發規格文件

> 最後更新：2026-06-03
> 來源規格：`/Users/chiao/Desktop/project/awesome-dsp-ui/docs/specs/phase0-spec.md`
> UAT 目標：2026-07-20，對象為 AOE 內部試用

---

## 目錄

1. [系統概覽](#1-系統概覽)
2. [廣告層級結構](#2-廣告層級結構)
3. [狀態機](#3-狀態機)
4. [預算規則](#4-預算規則)
5. [走期規則](#5-走期規則)
6. [認證機制](#6-認證機制)
7. [API Endpoints](#7-api-endpoints)
8. [Prisma Schema 草稿](#8-prisma-schema-草稿)
9. [前端規格](#9-前端規格)
10. [規格勘誤](#10-規格勘誤)

---

## 1. 系統概覽

### 1.1 目標

SuperDSP 2.0 整合 ODM 與 SuperDSP 1.0，Phase 0 目標是取代 ODM，供 AOE（OneAD 廣告操作人員）內部使用。

### 1.2 角色系統

| Role 值  | 說明                         | AOE 專屬欄位             |
| -------- | ---------------------------- | ------------------------ |
| `oneAD`  | AOE，OneAD 廣告操作人員      | 代理商、產品線、負責業務 |
| （其他） | 未來外部用戶，Phase 0 不實作 | —                        |

前端依 JWT payload 中的 role 欄位決定是否顯示 AOE 專屬欄位，設計需預留多角色擴充。

### 1.3 技術棧

| 層       | 技術                                                        |
| -------- | ----------------------------------------------------------- |
| Frontend | Vite + React + TanStack Router + TanStack Query + shadcn/ui |
| Backend  | NestJS + Prisma + MySQL 5.7                                 |
| 認證     | JWT + Masa（沿用 SuperDSP 1.0 架構）                        |
| Monorepo | Turborepo v2、pnpm workspace                                |

---

## 2. 廣告層級結構

```
Campaign（活動）
  └─ Line Item / LI（投放項目）
       └─ Creatives（廣告素材，多對多綁定）
```

### 2.1 各層職責

| 層級     | 預算                      | 走期                             | 重點職責                             |
| -------- | ------------------------- | -------------------------------- | ------------------------------------ |
| Campaign | 自設總預算（LI 加總上限） | 自設走期                         | 行銷目標（建立後不可修改）、預算上限 |
| LI       | 自設總預算 + 每日預算表   | 自設走期（需在 Campaign 範圍內） | 投放設定、素材綁定                   |
| Creative | —                         | —                                | 廣告格式、預覽、追蹤碼               |

---

## 3. 狀態機

### 3.1 LI 狀態定義

| 狀態        | 是否投放 | 說明                           |
| ----------- | -------- | ------------------------------ |
| `draft`     | 否       | 草稿，尚未啟用                 |
| `active`    | 是       | 啟用中                         |
| `paused`    | 否       | 暫停                           |
| `completed` | 否       | 終態，走期到期後自動收斂       |
| `deleted`   | 否       | 軟刪除，DB 保留，UI 預設不顯示 |

`completed` 與 `deleted` 為終態，不可逆。Campaign 無狀態機，僅有 `deletedAt` 記錄刪除時間。

### 3.2 LI 狀態轉換

| from \ to   | active            | paused      | deleted       |
| ----------- | ----------------- | ----------- | ------------- |
| `draft`     | ✅ 須通過啟用條件 | —           | ✅ kebab menu |
| `active`    | —                 | ✅ dropdown | ✅ kebab menu |
| `paused`    | ✅ 須通過啟用條件 | —           | ✅ kebab menu |
| `completed` | ❌                | ❌          | ❌            |
| `deleted`   | ❌                | ❌          | ❌            |

### 3.3 LI 啟用條件

LI 啟用須同時通過：

1. 自身狀態為 `draft` 或 `paused`
2. 預算 > 0
3. 底下綁定至少 1 個 **active** 的廣告素材（`Creative.isActive` AND `LICreativeBinding.isActive` 兩層都 true）
4. 自身預算 + 同層 LI 預算加總 ≤ Campaign 預算
5. `startDate` / `endDate` 皆已填，且 `endDate ≥ startDate`
6. 若 role 為 `oneAD`，`產品線` 不為空

### 3.4 Campaign 刪除規則

- **有花費（Campaign 底下任一 LI 有歷史花費）→ 不可刪除**，前後端都驗證，後端回 400
- **無花費 → 可刪除**：Campaign `deletedAt` 設為當前時間，底下所有 LI 一併軟刪除（`status → deleted`）

### 3.5 LI 自動收斂（completed）

- LI 走期 `endDate` 過期 → 自動設為 `completed`，停止投放
- `completed` LI 不可再修改或新增素材綁定

### 3.6 素材開關的狀態限制

**素材的 active / paused 開關不受父層 LI 狀態限制。**
即使 LI 為 `draft` 或 `paused`，使用者仍可在 LI 詳情頁對個別素材做開關。

設計原因：LI 啟用條件需要至少 1 個 active 素材，若素材開關受父層限制，會造成循環相依：

- LI 無法啟用（無 active 素材） → 素材無法開啟（父層未 active） → 死結

LI `paused` 時素材實際不投放，但不影響管理素材狀態的操作。

### 3.7 素材停用聯動

- 廣告素材停用後，若某 LI 的所有綁定素材皆已停用 → LI 自動從 `active` 降為 `paused`
- 觸發持久性 banner 通知，顯示在頁面頂部，使用者手動關閉

### 3.8 批次操作

- 支援批次暫停、批次啟用（LI 巢狀列表）
- **任一項目驗證失敗 → 整批回滾，不執行任何狀態變更**
- 失敗時跳出提醒，列出失敗項目及原因

---

## 4. 預算規則

### 4.1 結構

| 層級     | 預算模型                         |
| -------- | -------------------------------- |
| Campaign | 自設總預算，為底下 LI 加總的上限 |
| LI       | 自設總預算 + 每日預算表          |

### 4.2 驗證規則

- LI budget 加總 > Campaign budget → 擋住不給存，前後端都驗證，後端回 400
- 修改 Campaign 總預算，底下 LI 不自動重分配，僅改上限
- `deleted` LI 不計入加總；`completed` LI 仍計入

### 4.3 每日預算

#### 狀態

| 值     | 語意               | 均分時是否動 |
| ------ | ------------------ | ------------ |
| `null` | 待分配             | ✅ 會被填入  |
| `0`    | 刻意設 0，當天不投 | ❌ 跳過      |
| 正整數 | 已排定             | ❌ 保留      |

#### 時間軸鎖定

| 區間             | 規則                                      |
| ---------------- | ----------------------------------------- |
| 過去日（< 今天） | 完全鎖定，不可改                          |
| 今日             | 可調，但下限 = 今日已花費（`todaySpent`） |
| 未來日           | 完全可調                                  |

#### 操作行為

**建立 LI：**

- 總預算平均攤到走期每一天，餘數給最後一天（Floor 取整）

**修改 LI 總預算：**

- 跳出 dialog，詢問差額如何處理（二選一）：
  - A. 自動重新分配：差額平均分配至今日（保底 ≥ `todaySpent`）與未來日
  - B. 我自己處理：差額加入可分配預算池，每日表不動

**釋放預算：**

- 過去日：替換為實際花費，差額退回待分配池
- 今日：替換為實際花費，差額退回待分配池
- 未來日：全部清空（null），退回待分配池

**均分預算：**

- 可分配預算池 = 總預算 − 過去日已花費加總 − 已排定未來日
- 今日參與分配，保底 ≥ `todaySpent`
- 池平均分配至 `null` 的日期（跳過 `0` 與已排定正整數）
- 演算法：Floor 取整，餘數給最後一個待分配日

> 「釋放預算」與「均分預算」按鈕僅顯示於 LI 詳情頁，新建頁不顯示。

---

## 5. 走期規則

### 5.1 結構

| 層級     | 走期模型                           |
| -------- | ---------------------------------- |
| Campaign | 自設                               |
| LI       | 自設，但必須在 Campaign 走期範圍內 |

### 5.2 Campaign 改走期

若改 Campaign 走期導致任一 LI 超出範圍 → 直接擋住，不給修改，前後端都驗證。

### 5.3 LI 改走期

`endDate` 最早只能設定為今天，不可回推至過去日。

走期延長或縮短存檔時強制彈出 dialog（**無取消按鈕**）：

| 選項            | 總預算 | 每日表                                      |
| --------------- | ------ | ------------------------------------------- |
| A. 自動重新分配 | 不變   | 重新平均攤至新天數，手動排定值會被重算      |
| B. 我自己處理   | 不變   | 延長→新增日為 null；縮短→被砍日退回待分配池 |

頁面意外關閉 = 視同選 B，走期存檔成功，每日表不動。

---

## 6. 認證機制

### 6.1 架構

沿用 SuperDSP 1.0 的 JWT + Masa 驗證，不自建 login flow。

- Token 由 ERP 發行，`source: "SuperDSP"`，HS256 簽署，30 天有效
- JWT payload：`{ user_id, source: "SuperDSP", exp }`
- Frontend 存於 `localStorage`，每次請求帶 `Authorization: Bearer {token}`
- Backend 呼叫 Masa 驗證 token，取得 `user_id` + `role`

### 6.2 NestJS 實作

```typescript
// auth.guard.ts
@Injectable()
export class MasaAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization?.split(' ')[1];
    const { userId, role } = await this.masaService.verify(token);
    request.user = { userId, role };
    return true;
  }
}

// role.decorator.ts
export const Roles = (...roles: string[]) => SetMetadata('roles', roles);

// role.guard.ts
@Injectable()
export class RoleGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!roles) return true;
    const { user } = context.switchToHttp().getRequest();
    return roles.includes(user.role);
  }
}
```

---

## 7. API Endpoints

所有 API 前綴 `/api/v1`，回應格式統一為：

```json
{
  "data": <payload>,
  "meta": { "page": 1, "pageSize": 20, "total": 100 }  // 列表才有
}
```

分頁參數：`?page=1&pageSize=20`（Offset 分頁）

錯誤回應：

```json
{
  "statusCode": 400,
  "message": "LI 預算加總超過 Campaign 預算上限",
  "error": "BUDGET_EXCEEDED"
}
```

### 7.1 Campaign

```
GET    /campaigns                    # 列表（支援 search, page, pageSize）
POST   /campaigns                    # 建立
GET    /campaigns/:id                # 詳情
PATCH  /campaigns/:id                # 更新
DELETE /campaigns/:id                # 軟刪除（有花費時擋住；無花費時 Campaign + 底下 LI 一併刪除）
```

### 7.2 Line Item

```
GET    /line-items                   # 全域列表
GET    /campaigns/:campaignId/line-items               # 巢狀列表
POST   /campaigns/:campaignId/line-items               # 建立
GET    /line-items/:id               # 詳情
PATCH  /line-items/:id               # 更新
DELETE /line-items/:id               # 軟刪除
POST   /campaigns/:campaignId/line-items/batch/pause
POST   /campaigns/:campaignId/line-items/batch/activate
```

#### LI 每日預算

```
GET    /line-items/:id/daily-budgets               # 取得每日預算表
PUT    /line-items/:id/daily-budgets               # 整張更新
POST   /line-items/:id/daily-budgets/distribute    # 均分預算
POST   /line-items/:id/daily-budgets/release       # 釋放預算
```

#### LI 素材綁定

```
GET    /line-items/:id/creatives                   # 已綁定素材列表
POST   /line-items/:id/creatives                   # 新增綁定（body: { creativeId }）
DELETE /line-items/:id/creatives/:creativeId       # 解除綁定
PATCH  /line-items/:id/creatives/:creativeId       # 更新素材開關（body: { isActive }）
```

#### LI 追蹤碼套用

```
POST   /line-items/:id/apply-tracking              # 存檔追蹤碼後套用至素材
                                                   # body: { creativeIds: number[] }
```

### 7.3 Creative

```
GET    /creatives                    # 所有已綁定至少一個 LI 的素材（含成效）
GET    /creatives/:id                # 素材詳情
PATCH  /creatives/:id                # 更新素材設定（追蹤碼、啟用狀態）
```

素材停用時通知受影響的 LI（後端自動觸發狀態評估）。

### 7.4 追蹤碼模版

```
# OnePixel
GET    /tracking/onepixel            # 列表
POST   /tracking/onepixel            # 建立
GET    /tracking/onepixel/:id        # 詳情
PATCH  /tracking/onepixel/:id        # 更新
DELETE /tracking/onepixel/:id        # 刪除（自動移除所有 LI / 素材綁定）

# CCT
GET    /tracking/cct
POST   /tracking/cct
GET    /tracking/cct/:id
PATCH  /tracking/cct/:id
DELETE /tracking/cct/:id

# 第三方量測
GET    /tracking/third-party
POST   /tracking/third-party
GET    /tracking/third-party/:id
PATCH  /tracking/third-party/:id
DELETE /tracking/third-party/:id
```

刪除追蹤碼前，後端回傳受影響綁定數，前端顯示確認 dialog（「共有 N 個綁定將被解除」）。

### 7.5 設定 / 選項（動態清單）

```
GET    /config/pricing-models                      # 計價方式清單
GET    /config/product-lines                       # 產品線清單（AOE 限定）
GET    /config/ad-formats?marketingObjective=&adCategory=   # 廣告格式清單
GET    /config/ad-categories?marketingObjective=   # 廣告品類清單
GET    /config/targeting-options                   # 投放維度選項（地區、裝置等）
```

---

## 8. Prisma Schema 草稿

```prisma
enum Status {
  draft
  active
  paused
  completed
  deleted
}

enum MarketingObjective {
  BRAND_BUILDING
  PUSH_CONVERSION
  DRIVE_TRAFFIC
  OTHERS
}

enum DeliverStrategy {
  ASAP
  HOURLY_EVEN
}

model Campaign {
  id                 Int                @id @default(autoincrement())
  name               String
  marketingObjective MarketingObjective
  budget             Int                // 單位：元
  startDate          DateTime
  endDate            DateTime
  deletedAt          DateTime?
  createdAt          DateTime           @default(now())
  updatedAt          DateTime           @updatedAt

  lineItems LineItem[]
}

model LineItem {
  id                  Int            @id @default(autoincrement())
  campaignId          Int
  name                String
  budget              Int
  startDate           DateTime
  endDate             DateTime
  status              Status         @default(draft)
  adCategoryId        Int
  adFormatId          Int
  pricingModelId      Int
  deliverStrategy     DeliverStrategy
  priority            Int            // 10=一般, 30=高
  productLineId       Int?           // AOE only
  agencyName          String?        // AOE only
  salesRepName        String?        // AOE only
  cheapTrafficEnabled Boolean        @default(false)
  cheapTrafficRatio   Decimal?
  onePixelId          Int?
  thirdPartyTrackingId Int?
  createdAt           DateTime       @default(now())
  updatedAt           DateTime       @updatedAt

  campaign         Campaign          @relation(fields: [campaignId], references: [id])
  adCategory       AdCategory        @relation(fields: [adCategoryId], references: [id])
  adFormat         AdFormat          @relation(fields: [adFormatId], references: [id])
  pricingModel     PricingModel      @relation(fields: [pricingModelId], references: [id])
  productLine      ProductLine?      @relation(fields: [productLineId], references: [id])
  onePixel         OnePixelTemplate? @relation(fields: [onePixelId], references: [id])
  thirdPartyTracking ThirdPartyTrackingTemplate? @relation(fields: [thirdPartyTrackingId], references: [id])

  creativeBindings LICreativeBinding[]
  cctBindings      LICCTBinding[]
  dailyBudgets     DailyBudget[]
}

model Creative {
  id           Int      @id @default(autoincrement())
  name         String
  adFormatId   Int
  adCategoryId Int
  isActive     Boolean  @default(true)
  reviewStatus String   // approved / pending / rejected
  previewUrl   String?
  duration     Int?     // 秒
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  adFormat     AdFormat  @relation(fields: [adFormatId], references: [id])
  adCategory   AdCategory @relation(fields: [adCategoryId], references: [id])

  liBindings    LICreativeBinding[]
  onePixelId    Int?
  thirdPartyTrackingId Int?
  onePixel      OnePixelTemplate?         @relation(fields: [onePixelId], references: [id])
  thirdPartyTracking ThirdPartyTrackingTemplate? @relation(fields: [thirdPartyTrackingId], references: [id])
  cctBindings   CreativeCCTBinding[]
}

model LICreativeBinding {
  id           Int      @id @default(autoincrement())
  lineItemId   Int
  creativeId   Int
  isActive     Boolean  @default(true)
  createdAt    DateTime @default(now())

  lineItem     LineItem  @relation(fields: [lineItemId], references: [id])
  creative     Creative  @relation(fields: [creativeId], references: [id])

  @@unique([lineItemId, creativeId])
}

model DailyBudget {
  id         Int      @id @default(autoincrement())
  lineItemId Int
  date       DateTime @db.Date
  amount     Int?     // null = 待分配, 0 = 刻意不投

  lineItem   LineItem @relation(fields: [lineItemId], references: [id])

  @@unique([lineItemId, date])
}

// 設定表
model AdCategory {
  id   Int    @id @default(autoincrement())
  name String
  lineItems LineItem[]
  creatives Creative[]
  formatMappings AdFormatMapping[]
}

model AdFormat {
  id   Int    @id @default(autoincrement())
  name String
  lineItems LineItem[]
  creatives Creative[]
  formatMappings AdFormatMapping[]
}

model AdFormatMapping {
  id                 Int                @id @default(autoincrement())
  marketingObjective MarketingObjective
  adCategoryId       Int
  adFormatId         Int

  adCategory  AdCategory @relation(fields: [adCategoryId], references: [id])
  adFormat    AdFormat   @relation(fields: [adFormatId], references: [id])

  @@unique([marketingObjective, adCategoryId, adFormatId])
}

model PricingModel {
  id   Int    @id @default(autoincrement())
  name String
  lineItems LineItem[]
}

model ProductLine {
  id   Int    @id @default(autoincrement())
  name String
  lineItems LineItem[]
}

// 追蹤碼模版
model OnePixelTemplate {
  id        Int      @id @default(autoincrement())
  name      String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  lineItems LineItem[]
  creatives Creative[]
}

model CCTTemplate {
  id        Int      @id @default(autoincrement())
  name      String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  liBindings       LICCTBinding[]
  creativeBindings CreativeCCTBinding[]
}

model ThirdPartyTrackingTemplate {
  id                    Int      @id @default(autoincrement())
  name                  String
  doubleClickUrl        String?
  nielsenUrl            String?
  integralAdScienceUrl  String?
  doubleVerifyUrl       String?
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
  lineItems LineItem[]
  creatives Creative[]
}

// CCT 多對多（LI 可多選 CCT）
model LICCTBinding {
  lineItemId Int
  cctId      Int
  lineItem   LineItem    @relation(fields: [lineItemId], references: [id])
  cct        CCTTemplate @relation(fields: [cctId], references: [id])
  @@id([lineItemId, cctId])
}

model CreativeCCTBinding {
  creativeId Int
  cctId      Int
  creative   Creative    @relation(fields: [creativeId], references: [id])
  cct        CCTTemplate @relation(fields: [cctId], references: [id])
  @@id([creativeId, cctId])
}
```

---

## 9. 前端規格

### 9.1 StatusBadge 顏色

LI StatusBadge：

| 狀態        | 顏色       |
| ----------- | ---------- |
| `active`    | 綠色       |
| `paused`    | 黃色       |
| `draft`     | 灰色（淺） |
| `completed` | 藍色       |
| `deleted`   | 灰色（深） |

Campaign 列表不顯示狀態 Badge，改為顯示「N 個 LI 啟用中」的計數。

### 9.2 列表頁通用規格

| 項目         | 規格                        |
| ------------ | --------------------------- |
| 預設排序     | 建立時間倒序（ID 倒序）     |
| 分頁         | Offset，`page` + `pageSize` |
| 狀態篩選預設 | `all`（不含 `deleted`）     |
| 看 `deleted` | 明確切換到 `deleted` tab    |

### 9.3 欄位來源一覽

| 欄位         | 來源                                                     | 備註                           |
| ------------ | -------------------------------------------------------- | ------------------------------ |
| 計價方式     | `GET /config/pricing-models`                             | 動態清單                       |
| 廣告品類     | `GET /config/ad-categories?marketingObjective=`          | 依 Campaign 行銷目標過濾       |
| 廣告格式     | `GET /config/ad-formats?marketingObjective=&adCategory=` | 雙重過濾                       |
| 產品線       | `GET /config/product-lines`                              | AOE only                       |
| 投放節奏     | 靜態 enum                                                | `ASAP` / `HourlyEven`          |
| 投放優先層級 | 靜態 enum                                                | 一般（10）/ 高（30）           |
| 投放維度     | `GET /config/targeting-options`                          | 完整保留 SuperDSP 1.0 維度清單 |

### 9.4 投放維度清單（完整保留 1.0）

| 分類     | 欄位                                                 | API 參數              |
| -------- | ---------------------------------------------------- | --------------------- |
| 裝置     | 桌機 / 手機                                          | `target_devices`      |
| 地區     | 地區 + 城市                                          | `regions` + `cities`  |
| 投放時段 | 星期 × 時段（同 DV 360）                             | `hourlies`            |
| 版位排除 | 排除版位                                             | `excluded_medium_ids` |
| 品牌安全 | 品牌安全分類                                         | `brand_safety_ids`    |
| 受眾鎖定 | 人口統計、興趣、關鍵字、受眾包、情境鎖定、商品關鍵字 | 各自 API              |

### 9.5 Dialog 行為

#### 走期修改 Dialog（§5.3）

- 無取消按鈕，強制二選一
- 頁面意外關閉 → 視同選 B（走期存檔，每日表不動）

#### 追蹤碼套用 Dialog（§8.3.1）

- 觸發時機：編輯既有 LI 存檔後（新建 LI 不觸發）
- 預設全選所有已綁定素材
- 無取消按鈕，強制完成後才算 LI 存檔成功
- 頁面關閉 → LI 修改未儲存

#### 追蹤碼刪除確認 Dialog

- 顯示「共有 N 個綁定將被解除」
- 確認後後端自動移除所有 LI / 素材綁定

### 9.6 複製功能

Campaign 與 LI 皆有複製功能，由前端實作（讀取現有資料後呼叫建立 API），無專屬後端 endpoint。

**共用規則：**

- 點擊「複製」先跳確認 dialog（防止誤觸產生多餘草稿）：「確定要複製「原名稱」嗎？」
- 複製後名稱 = 截斷原名稱後加 ` (copy)`，總長不超過欄位上限
- 複製成功後只重新整理清單，無 toast 通知

**Campaign 複製：**

- 複製 Campaign 自身欄位（不含底下 LI）
- 新 Campaign status = `DRAFT`
- 走期日期照搬

**LI 複製：**

- 複製 LI 自身欄位，**不含**素材綁定與追蹤碼設定
- 新 LI status = `draft`
- 走期日期照搬

### 9.7 素材列表開關行為（§9.2.1）

從素材列表關閉素材時：

- 跳出 dialog 列出所有綁定該素材的 LI，讓使用者選擇套用哪些 LI
- **僅顯示有其他素材的 LI**（可選）
- 「只有此素材的 LI」顯示但 disabled，附說明「此 LI 只有這個素材，無法從這裡關閉」
- 該素材停用後，若 LI 所有素材皆停用 → LI 自動 paused（參見 §3.7）

### 9.8 追蹤碼管理頁路由

```
/tracking/onepixel       # OnePixel 列表與 CRUD
/tracking/cct            # CCT 列表與 CRUD
/tracking/third-party    # 第三方量測列表與 CRUD
```

---

## 10. 規格勘誤

| 章節           | 問題                              | 修正                                   |
| -------------- | --------------------------------- | -------------------------------------- |
| §8.3 LI 欄位表 | 有「出價策略」欄位                | 應刪除，此為「計價方式」的誤寫         |
| §3.4           | 未定義子層全部 deleted 時父層行為 | 補充：子層全 deleted → 父層自動 paused |
