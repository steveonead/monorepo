import { CampaignStatus } from '@superdsp/api-schemas/campaigns/campaign';
import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';

import { CampaignListView } from '@/features/campaign/components/campaign-list';

// 分頁與 status 篩選的狀態以 URL search params 為單一真實來源；
// 用 .catch() 讓不合法的值退回安全預設，避免使用者改網址造成 crash。
const campaignSearchSchema = z.object({
  // .default() 讓 input 可省略（search 整體變 optional），既有 navigate({ to: '/campaigns' }) 不需帶 search
  page: z.coerce.number().int().positive().catch(1).default(1),
  status: CampaignStatus.optional().catch(undefined),
});

export const Route = createFileRoute('/_auth/campaigns/')({
  validateSearch: campaignSearchSchema,
  component: RouteComponent,
  errorComponent: () => (
    <div className="text-destructive p-4 text-sm">載入 campaign 列表失敗，請稍後再試。</div>
  ),
});

function RouteComponent() {
  const { page, status } = Route.useSearch();
  const navigate = Route.useNavigate();

  return (
    <CampaignListView
      page={page}
      status={status}
      onChange={(next) => navigate({ search: next })}
    />
  );
}
