# Vitest 作為 NestJS 測試框架

選用 Vitest 取代 NestJS 預設的 Jest，原因如下：

- 執行速度快，watch mode 尤其明顯
- 與 frontend 統一使用同一測試框架，降低 monorepo 工具鏈複雜度
- NestJS v12 已宣布將 Vitest + SWC 列為 ESM 專案預設，方向與官方路線一致

`@nestjs/testing` 透過 `unplugin-swc` 橋接 decorator metadata，實際可用。

## 考慮過的選項

- **Jest + SWC**：NestJS 官方支援的加速方案，未正式評估。Vitest 在 monorepo 工具鏈一致性上有明顯優勢，直接採用。
