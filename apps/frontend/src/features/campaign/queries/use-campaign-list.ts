import { useQuery } from '@tanstack/react-query';

import type { CampaignListParams } from './keys';

import { campaignListOptions } from './campaign-queries';

export function useCampaignList(params: CampaignListParams) {
  return useQuery(campaignListOptions(params));
}
