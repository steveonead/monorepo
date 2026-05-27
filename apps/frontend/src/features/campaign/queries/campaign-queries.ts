import { CampaignListResponseSchema } from '@superdsp/api-schemas/campaigns/campaign';
import { keepPreviousData, queryOptions } from '@tanstack/react-query';

import { sendRequest } from '@/lib/axios';

import type { CampaignListParams } from './keys';

import { campaignKeys } from './keys';

export function campaignListOptions(params: CampaignListParams) {
  return queryOptions({
    queryKey: campaignKeys.list(params),
    queryFn: () =>
      sendRequest(
        {
          method: 'get',
          url: '/campaigns',
          params: { page: params.page, status: params.status },
        },
        { schema: CampaignListResponseSchema },
      ),
    // 切換頁碼或篩選時保留上一頁資料，避免列表閃爍
    placeholderData: keepPreviousData,
  });
}
