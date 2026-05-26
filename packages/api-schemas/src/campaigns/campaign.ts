import { z } from 'zod';

import { createApiSuccessSchema, createPaginatedResponseSchema } from '@/base/api.js';

export const CampaignStatus = z.enum(['ACTIVE', 'PAUSED', 'ENDED', 'DRAFT']);

export const CampaignSchema = z.object({
  id: z.uuid(),
  name: z.string().min(1).max(100),
  status: CampaignStatus,
  advertiserName: z.string().min(1).max(100),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().nullable(),
  budgetTwd: z.number().int().positive().optional(),
});

export type Campaign = z.infer<typeof CampaignSchema>;

export const CreateCampaignSchema = CampaignSchema.omit({ id: true });

export type CreateCampaign = z.infer<typeof CreateCampaignSchema>;

// PATCH 採部分更新：所有欄位皆可選，只驗證有提供的欄位
export const UpdateCampaignSchema = CampaignSchema.omit({ id: true }).partial();

export type UpdateCampaign = z.infer<typeof UpdateCampaignSchema>;

export const CampaignListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().default(20),
  status: CampaignStatus.optional(),
});

export type CampaignListQuery = z.infer<typeof CampaignListQuerySchema>;

export const CampaignDetailResponseSchema = createApiSuccessSchema(CampaignSchema);
export const CampaignListResponseSchema = createPaginatedResponseSchema(CampaignSchema);

export type CampaignDetailResponse = z.infer<typeof CampaignDetailResponseSchema>;
export type CampaignListResponse = z.infer<typeof CampaignListResponseSchema>;
