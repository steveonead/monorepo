import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { CampaignListView } from '@/features/campaign/components/campaign-list';

// 只 mock axios 這個網路邊界，保留 sendRequest + schema.parse 真實執行
const { mockRequest } = vi.hoisted(() => ({ mockRequest: vi.fn() }));

vi.mock('axios', () => ({
  default: {
    create: () => ({
      request: mockRequest,
      interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn() },
      },
    }),
  },
}));

type CampaignItem = {
  id: string;
  name: string;
  advertiserName: string;
  status: string;
  startDate: string;
  endDate: string | null;
  budgetTwd?: number;
};

function makeCampaign(overrides: Partial<CampaignItem> = {}): CampaignItem {
  return {
    id: crypto.randomUUID(),
    name: '春季品牌活動',
    advertiserName: 'Acme 廣告主',
    status: 'ACTIVE',
    startDate: '2026-01-01',
    endDate: '2026-03-31',
    budgetTwd: 1_000_000,
    ...overrides,
  };
}

function buildListPayload(options: {
  items?: CampaignItem[];
  total?: number;
  page?: number;
  pageSize?: number;
}) {
  const items = options.items ?? [];
  return {
    data: {
      status: 'success',
      data: {
        items,
        total: options.total ?? items.length,
        page: options.page ?? 1,
        pageSize: options.pageSize ?? 20,
      },
    },
  };
}

function renderView(props: { page?: number; status?: string } = {}) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const onChange = vi.fn();
  const utils = render(
    <QueryClientProvider client={queryClient}>
      <CampaignListView
        page={props.page ?? 1}
        status={props.status as never}
        onChange={onChange}
      />
    </QueryClientProvider>,
  );
  return { onChange, ...utils };
}

beforeEach(() => {
  mockRequest.mockReset();
});

describe('campaignListView', () => {
  it('顯示名稱、廣告主、Status、預算、起訖日期五欄位與該列資料', async () => {
    mockRequest.mockResolvedValue(buildListPayload({ items: [makeCampaign()] }));

    renderView();

    expect(await screen.findByRole('columnheader', { name: '名稱' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: '廣告主' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Status' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: '預算' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: '起訖日期' })).toBeInTheDocument();

    expect(await screen.findByText('春季品牌活動')).toBeInTheDocument();
    expect(screen.getByText('Acme 廣告主')).toBeInTheDocument();
    expect(screen.getByText('ACTIVE')).toBeInTheDocument();
    expect(screen.getByText('NT$1,000,000')).toBeInTheDocument();
    expect(screen.getByText('2026/01/01 ~ 2026/03/31')).toBeInTheDocument();
  });

  it('後端沒有資料時顯示空狀態提示', async () => {
    mockRequest.mockResolvedValue(buildListPayload({ items: [], total: 0 }));

    renderView();

    expect(await screen.findByText('目前沒有 campaign 資料')).toBeInTheDocument();
  });

  it('資料載入中時顯示載入提示，且不顯示空狀態', async () => {
    // 讓 request 永不 resolve，元件維持 isPending（初次載入、尚無資料）
    mockRequest.mockReturnValue(new Promise(() => {}));

    renderView();

    expect(await screen.findByText('載入中…')).toBeInTheDocument();
    expect(screen.queryByText('目前沒有 campaign 資料')).not.toBeInTheDocument();
  });

  it('總筆數超過每頁上限時顯示分頁，點下一頁以 page+1 並保留 status 呼叫 onChange', async () => {
    // 25 筆、每頁 20 → 共 2 頁
    mockRequest.mockResolvedValue(
      buildListPayload({ items: [makeCampaign()], total: 25, page: 1, pageSize: 20 }),
    );

    const user = userEvent.setup();
    const { onChange } = renderView({ page: 1, status: 'ACTIVE' });

    const next = await screen.findByText('下一頁');
    await user.click(next);

    expect(onChange).toHaveBeenCalledWith({ page: 2, status: 'ACTIVE' });
  });

  it('總筆數未超過每頁上限時不顯示分頁', async () => {
    mockRequest.mockResolvedValue(
      buildListPayload({ items: [makeCampaign()], total: 5, page: 1, pageSize: 20 }),
    );

    renderView();

    expect(await screen.findByText('春季品牌活動')).toBeInTheDocument();
    expect(screen.queryByText('下一頁')).not.toBeInTheDocument();
  });

  it('選擇特定 status 時以該 status 並重置 page 為 1 呼叫 onChange', async () => {
    mockRequest.mockResolvedValue(buildListPayload({ items: [makeCampaign()], total: 5 }));

    const user = userEvent.setup();
    const { onChange } = renderView({ page: 3, status: undefined });

    await user.click(await screen.findByRole('combobox'));
    await user.click(await screen.findByRole('option', { name: 'PAUSED' }));

    expect(onChange).toHaveBeenCalledWith({ status: 'PAUSED', page: 1 });
  });

  it('清除 status 篩選時以 status undefined 並重置 page 為 1 呼叫 onChange', async () => {
    mockRequest.mockResolvedValue(buildListPayload({ items: [makeCampaign()], total: 5 }));

    const user = userEvent.setup();
    const { onChange } = renderView({ page: 2, status: 'ACTIVE' });

    await user.click(await screen.findByRole('combobox'));
    await user.click(await screen.findByRole('option', { name: '全部 status' }));

    expect(onChange).toHaveBeenCalledWith({ status: undefined, page: 1 });
  });
});
