import {
  CampaignDetailResponseSchema,
  CampaignListQuerySchema,
  CampaignListResponseSchema,
  CreateCampaignSchema,
  UpdateCampaignSchema,
} from '@superdsp/api-schemas/campaigns/campaign';
import { createZodDto } from 'nestjs-zod';

export class CreateCampaignDto extends createZodDto(CreateCampaignSchema) {}
export class UpdateCampaignDto extends createZodDto(UpdateCampaignSchema) {}
export class CampaignListQueryDto extends createZodDto(CampaignListQuerySchema) {}
export class CampaignListResponseDto extends createZodDto(CampaignListResponseSchema) {}
export class CampaignDetailResponseDto extends createZodDto(CampaignDetailResponseSchema) {}
