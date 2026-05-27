import type { UpdateCampaign } from '@superdsp/api-schemas/campaigns/campaign';

import { useMutation } from '@tanstack/react-query';

import { campaignKeys } from '@/features/campaign/queries/keys';
import { sendRequest } from '@/lib/axios';

export function useUpdateCampaign() {
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCampaign }) =>
      sendRequest({ method: 'patch', url: `/campaigns/${id}`, data }),
    meta: { invalidates: [campaignKeys.all()] },
  });
}
