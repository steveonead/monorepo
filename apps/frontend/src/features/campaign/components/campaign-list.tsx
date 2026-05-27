import type { Campaign } from '@superdsp/api-schemas/campaigns/campaign';

import { CampaignStatus } from '@superdsp/api-schemas/campaigns/campaign';

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useCampaignList } from '@/features/campaign/queries/use-campaign-list';
import { cn } from '@/lib/utils';

type CampaignFilter = {
  page: number;
  status?: Campaign['status'];
};

type CampaignListViewProps = CampaignFilter & {
  onChange: (next: CampaignFilter) => void;
};

const STATUS_FILTER_ITEMS: { value: Campaign['status'] | null; label: string }[] = [
  { value: null, label: '全部 status' },
  ...CampaignStatus.options.map((status) => ({ value: status, label: status })),
];

function formatDate(date: Date) {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}/${month}/${day}`;
}

function formatDateRange(startDate: Date, endDate: Date | null) {
  return endDate
    ? `${formatDate(startDate)} ~ ${formatDate(endDate)}`
    : `${formatDate(startDate)} ~ 無截止`;
}

function formatBudget(budgetTwd?: number) {
  return budgetTwd === undefined ? '—' : `NT$${budgetTwd.toLocaleString('en-US')}`;
}

export function CampaignListView({ page, status, onChange }: CampaignListViewProps) {
  const { data, isPending } = useCampaignList({ page, status });
  const campaigns = data?.data.items ?? [];
  const isEmpty = !isPending && campaigns.length === 0;

  const total = data?.data.total ?? 0;
  const pageSize = data?.data.pageSize ?? 0;
  const totalPages = pageSize > 0 ? Math.ceil(total / pageSize) : 1;
  const hasPagination = totalPages > 1;
  const canGoPrev = page > 1;
  const canGoNext = page < totalPages;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <Select
          items={STATUS_FILTER_ITEMS}
          value={status ?? null}
          onValueChange={(value) => {
            onChange({ status: (value as Campaign['status'] | null) ?? undefined, page: 1 });
          }}
        >
          <SelectTrigger
            className="w-48"
            aria-label="篩選 status"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {STATUS_FILTER_ITEMS.map((item) => (
                <SelectItem
                  key={item.value ?? 'all'}
                  value={item.value}
                >
                  {item.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>名稱</TableHead>
            <TableHead>廣告主</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>預算</TableHead>
            <TableHead>起訖日期</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isPending && (
            <TableRow>
              <TableCell
                colSpan={5}
                className="text-muted-foreground h-24 text-center"
              >
                載入中…
              </TableCell>
            </TableRow>
          )}
          {isEmpty && (
            <TableRow>
              <TableCell
                colSpan={5}
                className="text-muted-foreground h-24 text-center"
              >
                目前沒有 campaign 資料
              </TableCell>
            </TableRow>
          )}
          {campaigns.map((campaign) => (
            <TableRow key={campaign.id}>
              <TableCell>{campaign.name}</TableCell>
              <TableCell>{campaign.advertiserName}</TableCell>
              <TableCell>{campaign.status}</TableCell>
              <TableCell>{formatBudget(campaign.budgetTwd)}</TableCell>
              <TableCell>{formatDateRange(campaign.startDate, campaign.endDate)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {hasPagination && (
        <Pagination className="justify-end">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                text="上一頁"
                aria-label="上一頁"
                aria-disabled={!canGoPrev}
                className={cn(!canGoPrev && 'pointer-events-none opacity-50')}
                onClick={(event) => {
                  event.preventDefault();
                  if (canGoPrev) onChange({ page: page - 1, status });
                }}
              />
            </PaginationItem>
            <PaginationItem>
              <span className="text-muted-foreground px-3 text-sm">
                第 {page} 頁，共 {totalPages} 頁
              </span>
            </PaginationItem>
            <PaginationItem>
              <PaginationNext
                text="下一頁"
                aria-label="下一頁"
                aria-disabled={!canGoNext}
                className={cn(!canGoNext && 'pointer-events-none opacity-50')}
                onClick={(event) => {
                  event.preventDefault();
                  if (canGoNext) onChange({ page: page + 1, status });
                }}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
