import type { Campaign } from '@superdsp/api-schemas/campaigns/campaign';

import { createQueryKeys } from '@/lib/tanstack/query-keys';

export type CampaignListParams = {
  page: number;
  status?: Campaign['status'];
};

export const campaignKeys = createQueryKeys('campaigns', {
  list: (params: CampaignListParams) => [params] as const,
});
