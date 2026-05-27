import type { Campaign } from '@superdsp/api-schemas/campaigns/campaign';
import type { AxiosRequestConfig } from 'axios';

import { matchQuery, MutationCache, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { CampaignFormDialog } from '@/features/campaign/components/campaign-form-dialog';
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

function listResponse(items: CampaignItem[]) {
  return {
    data: {
      status: 'success',
      data: { items, total: items.length, page: 1, pageSize: 20 },
    },
  };
}

function detailResponse(item: unknown) {
  return { data: { status: 'success', data: item } };
}

// 以可變的 items 模擬後端：mutation 後 GET 會回傳更新後的列表，
// 用來驗證 meta.invalidates 觸發的 refetch 反映最新資料。
function setupApi(initialItems: CampaignItem[]) {
  let items = initialItems;
  const idOf = (config: AxiosRequestConfig) => String(config.url).split('/').pop();

  mockRequest.mockImplementation((config: AxiosRequestConfig) => {
    switch (config.method) {
      case 'get':
        return Promise.resolve(listResponse(items));
      case 'post': {
        const created = makeCampaign({ ...(config.data as object), id: crypto.randomUUID() });
        items = [...items, created];
        return Promise.resolve(detailResponse(created));
      }
      case 'patch': {
        const id = idOf(config);
        items = items.map((c) => (c.id === id ? { ...c, ...(config.data as object) } : c));
        return Promise.resolve(detailResponse(items.find((c) => c.id === id)));
      }
      case 'delete': {
        const id = idOf(config);
        items = items.filter((c) => c.id !== id);
        return Promise.resolve(detailResponse(null));
      }
      default:
        throw new Error(`未預期的 request: ${config.method} ${config.url}`);
    }
  });
}

function callsByMethod(method: string): AxiosRequestConfig[] {
  return mockRequest.mock.calls
    .map(([config]) => config as AxiosRequestConfig)
    .filter((config) => config.method === method);
}

function postCalls() {
  return callsByMethod('post');
}

function patchCalls() {
  return callsByMethod('patch');
}

function deleteCalls() {
  return callsByMethod('delete');
}

function renderView(props: { page?: number; status?: string } = {}) {
  // mutationCache 鏡像 production：依 meta.invalidates 做宣告式失效，驗證 refetch
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
    mutationCache: new MutationCache({
      // eslint-disable-next-line max-params
      onSuccess: (_data, _vars, _ctx, mutation) => {
        void queryClient.invalidateQueries({
          predicate: (query) =>
            mutation.meta?.invalidates?.some((queryKey) => matchQuery({ queryKey }, query)) ??
            false,
        });
      },
    }),
  });
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

describe('campaign 新增', () => {
  it('點「新增」開啟新增表單 Modal', async () => {
    setupApi([makeCampaign()]);

    const user = userEvent.setup();
    renderView();

    await user.click(await screen.findByRole('button', { name: '新增' }));

    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByText('新增 campaign')).toBeInTheDocument();
  });

  it('必填未填即送出時顯示欄位錯誤且不呼叫建立 API', async () => {
    setupApi([makeCampaign()]);

    const user = userEvent.setup();
    renderView();

    await user.click(await screen.findByRole('button', { name: '新增' }));
    const dialog = await screen.findByRole('dialog');
    await user.click(within(dialog).getByRole('button', { name: '建立' }));

    expect(await within(dialog).findByText('請輸入名稱')).toBeInTheDocument();
    expect(postCalls()).toHaveLength(0);
  });

  it('名稱超過 100 字時顯示「名稱不得超過 100 個字元」且不呼叫建立 API', async () => {
    setupApi([makeCampaign()]);

    const user = userEvent.setup();
    renderView();

    await user.click(await screen.findByRole('button', { name: '新增' }));
    const dialog = await screen.findByRole('dialog');

    await user.click(within(dialog).getByLabelText('名稱'));
    await user.paste('a'.repeat(101));
    await user.click(within(dialog).getByRole('button', { name: '建立' }));

    expect(await within(dialog).findByText('名稱不得超過 100 個字元')).toBeInTheDocument();
    expect(postCalls()).toHaveLength(0);
  });

  it('填妥必填送出後呼叫 POST /campaigns、關閉 Modal 並 refetch 反映新資料', async () => {
    setupApi([makeCampaign({ name: '春季品牌活動' })]);

    const user = userEvent.setup();
    renderView();

    await user.click(await screen.findByRole('button', { name: '新增' }));
    const dialog = await screen.findByRole('dialog');

    await user.type(within(dialog).getByLabelText('名稱'), '夏季衝刺活動');
    await user.type(within(dialog).getByLabelText('廣告主'), 'Beta 廣告主');
    fireEvent.change(within(dialog).getByLabelText('開始日期'), {
      target: { value: '2026-06-01' },
    });

    await user.click(within(dialog).getByRole('button', { name: '建立' }));

    await waitFor(() => expect(postCalls()).toHaveLength(1));
    expect(postCalls()[0]?.url).toBe('/campaigns');
    expect(postCalls()[0]?.data).toMatchObject({
      name: '夏季衝刺活動',
      advertiserName: 'Beta 廣告主',
      status: 'DRAFT',
    });

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(await screen.findByText('夏季衝刺活動')).toBeInTheDocument();
  });
});

describe('campaign 編輯', () => {
  it('點某列「編輯」開啟 Modal 並預填該列現有資料', async () => {
    setupApi([
      makeCampaign({ name: '春季品牌活動', advertiserName: 'Acme 廣告主', status: 'ACTIVE' }),
    ]);

    const user = userEvent.setup();
    renderView();

    await user.click(await screen.findByRole('button', { name: '編輯' }));
    const dialog = await screen.findByRole('dialog');

    expect(within(dialog).getByText('編輯 campaign')).toBeInTheDocument();
    expect(within(dialog).getByLabelText('名稱')).toHaveValue('春季品牌活動');
    expect(within(dialog).getByLabelText('廣告主')).toHaveValue('Acme 廣告主');
  });

  it('清空必填欄位送出時顯示驗證錯誤且不呼叫更新 API', async () => {
    setupApi([makeCampaign({ name: '春季品牌活動' })]);

    const user = userEvent.setup();
    renderView();

    await user.click(await screen.findByRole('button', { name: '編輯' }));
    const dialog = await screen.findByRole('dialog');

    await user.clear(within(dialog).getByLabelText('名稱'));
    await user.click(within(dialog).getByRole('button', { name: '更新' }));

    expect(await within(dialog).findByText('請輸入名稱')).toBeInTheDocument();
    expect(patchCalls()).toHaveLength(0);
  });

  it('修改後送出呼叫 PATCH /campaigns/:id、關閉 Modal 並 refetch 反映最新', async () => {
    const target = makeCampaign({ name: '春季品牌活動' });
    setupApi([target]);

    const user = userEvent.setup();
    renderView();

    await user.click(await screen.findByRole('button', { name: '編輯' }));
    const dialog = await screen.findByRole('dialog');

    const nameInput = within(dialog).getByLabelText('名稱');
    await user.clear(nameInput);
    await user.type(nameInput, '春季品牌活動（改）');
    await user.click(within(dialog).getByRole('button', { name: '更新' }));

    await waitFor(() => expect(patchCalls()).toHaveLength(1));
    expect(patchCalls()[0]?.url).toBe(`/campaigns/${target.id}`);
    expect(patchCalls()[0]?.data).toMatchObject({ name: '春季品牌活動（改）' });

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(await screen.findByText('春季品牌活動（改）')).toBeInTheDocument();
  });
});

describe('campaign 刪除', () => {
  it('點某列「刪除」開啟確認 AlertDialog', async () => {
    setupApi([makeCampaign({ name: '春季品牌活動' })]);

    const user = userEvent.setup();
    renderView();

    await user.click(await screen.findByRole('button', { name: '刪除' }));

    const alert = await screen.findByRole('alertdialog');
    expect(within(alert).getByText('確定刪除「春季品牌活動」？')).toBeInTheDocument();
  });

  it('點「確定刪除」呼叫 DELETE /campaigns/:id 並移除該列', async () => {
    const target = makeCampaign({ name: '春季品牌活動' });
    setupApi([target, makeCampaign({ name: '另一個活動' })]);

    const user = userEvent.setup();
    renderView();

    expect(await screen.findByText('春季品牌活動')).toBeInTheDocument();

    const targetRow = screen.getByRole('row', { name: /春季品牌活動/ });
    await user.click(within(targetRow).getByRole('button', { name: '刪除' }));

    const alert = await screen.findByRole('alertdialog');
    await user.click(within(alert).getByRole('button', { name: '確定刪除' }));

    await waitFor(() => expect(deleteCalls()).toHaveLength(1));
    expect(deleteCalls()[0]?.url).toBe(`/campaigns/${target.id}`);

    await waitFor(() => expect(screen.queryByText('春季品牌活動')).not.toBeInTheDocument());
    expect(screen.getByText('另一個活動')).toBeInTheDocument();
  });

  it('點「取消」不呼叫 DELETE 且保留該列', async () => {
    setupApi([makeCampaign({ name: '春季品牌活動' })]);

    const user = userEvent.setup();
    renderView();

    await user.click(await screen.findByRole('button', { name: '刪除' }));
    const alert = await screen.findByRole('alertdialog');
    await user.click(within(alert).getByRole('button', { name: '取消' }));

    await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
    expect(deleteCalls()).toHaveLength(0);
    expect(screen.getByText('春季品牌活動')).toBeInTheDocument();
  });
});

describe('campaign 編輯 Dialog 退場', () => {
  function editTarget(): Campaign {
    return {
      id: 'campaign-edit-1',
      name: '春季品牌活動',
      advertiserName: 'Acme 廣告主',
      status: 'ACTIVE',
      startDate: new Date('2026-01-01T00:00:00Z'),
      endDate: new Date('2026-03-31T00:00:00Z'),
      budgetTwd: 1_000_000,
    } as Campaign;
  }

  function dialogTree(client: QueryClient, campaign: Campaign | undefined) {
    return (
      <QueryClientProvider client={client}>
        <CampaignFormDialog
          open
          campaign={campaign}
          onOpenChange={() => {}}
        />
      </QueryClientProvider>
    );
  }

  // 重現關閉編輯 Dialog 時的標題閃爍：退場動畫期間 DialogContent 仍掛載，
  // 但 parent 已將 campaign 清為 undefined。jsdom 不跑動畫、關閉即卸載，
  // 故以 open 維持 true、清空 campaign 作為「內容仍可見」的決定性代理。
  it('campaign 被清空但 Dialog 仍顯示時，標題維持「編輯 campaign」不翻成新增', async () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const { rerender } = render(dialogTree(client, editTarget()));

    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByText('編輯 campaign')).toBeInTheDocument();

    rerender(dialogTree(client, undefined));

    const closingDialog = screen.getByRole('dialog');
    expect(within(closingDialog).getByText('編輯 campaign')).toBeInTheDocument();
    expect(within(closingDialog).queryByText('新增 campaign')).not.toBeInTheDocument();
  });
});
