import { z } from 'zod';

import { createApiSuccessSchema, createPaginatedResponseSchema } from '../base/api.js';

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

export const CampaignDetailResponseSchema = createApiSuccessSchema(CampaignSchema);
export const CampaignListResponseSchema = createPaginatedResponseSchema(CampaignSchema);

export type CampaignDetailResponse = z.infer<typeof CampaignDetailResponseSchema>;
export type CampaignListResponse = z.infer<typeof CampaignListResponseSchema>;
