# MySQL 5.7（公司 infrastructure 限制）

本專案使用 MySQL 5.7，完全出於公司 infrastructure 限制，非技術選型。MySQL 5.7 已於 2023/10 EOL（不再有安全更新），目前無升級計畫。

## 後果

- 禁止使用 MySQL 8.0 專屬語法：window functions、`WITH` CTE、`JSON_TABLE`、`REGEXP_LIKE` 等
- 無安全修補，需依賴網路層與應用層防護
- Prisma 設定使用 `engine: "classic"`（snapshot engine 需 MySQL 8.0+）
