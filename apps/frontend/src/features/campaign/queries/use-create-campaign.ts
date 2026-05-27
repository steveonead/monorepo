import type { CreateCampaign } from '@superdsp/api-schemas/campaigns/campaign';

import { useMutation } from '@tanstack/react-query';

import { campaignKeys } from '@/features/campaign/queries/keys';
import { sendRequest } from '@/lib/axios';

export function useCreateCampaign() {
  return useMutation({
    mutationFn: (data: CreateCampaign) => sendRequest({ method: 'post', url: '/campaigns', data }),
    meta: { invalidates: [campaignKeys.all()] },
  });
}
