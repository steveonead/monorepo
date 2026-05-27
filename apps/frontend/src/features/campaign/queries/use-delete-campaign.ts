import { useMutation } from '@tanstack/react-query';

import { campaignKeys } from '@/features/campaign/queries/keys';
import { sendRequest } from '@/lib/axios';

export function useDeleteCampaign() {
  return useMutation({
    mutationFn: (id: string) => sendRequest({ method: 'delete', url: `/campaigns/${id}` }),
    meta: { invalidates: [campaignKeys.all()] },
  });
}
