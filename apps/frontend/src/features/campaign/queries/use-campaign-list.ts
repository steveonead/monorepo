import { useQuery } from '@tanstack/react-query';

import type { CampaignListParams } from '@/features/campaign/queries/keys';

import { campaignListOptions } from '@/features/campaign/queries/campaign-queries';

export function useCampaignList(params: CampaignListParams) {
  return useQuery(campaignListOptions(params));
}
