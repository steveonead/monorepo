# ADR 0005：採用 MySQL 5.7 作為資料庫，並允許多 database 連線

**狀態：** 已採納

## 決策

本專案在公司現有 MySQL 5.7 叢集上新開 database，以 Prisma 7 連線。同時保留多 database 連線能力，供日後整合公司其他既有 database。

## 背景

公司基礎建設已鎖定 MySQL 5.7 叢集。本專案需要從此叢集新開一個專屬 database，並可能在日後同時連線其他既有 database（如其他系統的舊有資料表）。

評估過的替代方案：

- **PostgreSQL**：功能更完整（CTE、window function、原生 UUID、全文索引），但公司基礎建設不支援。
- **MySQL 8.0**：修正 5.7 的諸多限制，且仍在 active support，但公司叢集未升級，無法採用。

## 取捨

MySQL 5.7 自 2023-10 起已進入 EOL，不再收到官方安全更新。此為已知風險，由公司基礎建設團隊承擔，非本專案可控。

MySQL 5.7 缺少下列功能，開發時需迴避：

| 限制               | 說明                            |
| ------------------ | ------------------------------- |
| CTE（`WITH` 語法） | 不支援，`$queryRaw` 禁用        |
| Window function    | 不支援，`$queryRaw` 禁用        |
| 原生 `UUID` 型別   | 改用 `VARCHAR(36)` 或應用層生成 |

Prisma 7 正式支援 MySQL 5.6+，技術上相容 5.7.44。

## 影響

- `schema.prisma` 的 `datasource` provider 設為 `mysql`。
- Prisma 7 已移除 Rust query engine，改採 Wasm query compiler + driver adapter 架構。連線 MySQL 必須透過 `@prisma/adapter-mariadb`，`PrismaClientOptions` 強制要求 `adapter` 或 `accelerateUrl`，無「無 adapter」選項。
- `PrismaService` 初始化方式：

  ```typescript
  import { PrismaMariaDb } from '@prisma/adapter-mariadb';
  super({ adapter: new PrismaMariaDb(process.env.DATABASE_URL) });
  ```

- 若需連線多個既有 database，以多個 Prisma Client 實例搭配各自的 `PrismaMariaDb` adapter 分別管理。
- `$queryRaw` 中禁止使用 CTE 與 window function，需改以應用層邏輯或子查詢替代。
- 待公司基礎建設升級至 MySQL 8.0 或 PostgreSQL 後，應重新評估此決策。
