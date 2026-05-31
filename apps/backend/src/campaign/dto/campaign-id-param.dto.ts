import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

// path param 為 server-only 輸入，全域啟用 strictSchemaDeclaration 後，
// 每個 @Param 都必須是 ZodDto，否則 pipe 會拋 ZodSchemaDeclarationException（500）。
// id 與 CampaignSchema.id 一致採 z.uuid()。
const CampaignIdParamSchema = z.object({ id: z.uuid() });

export class CampaignIdParamDto extends createZodDto(CampaignIdParamSchema) {}
