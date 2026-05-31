import type { Campaign } from '@superdsp/api-schemas/campaigns/campaign';

import { CampaignStatusSchema } from '@superdsp/api-schemas/campaigns/campaign';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
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
import { CampaignFormDialog } from '@/features/campaign/components/campaign-form-dialog';
import { DeleteCampaignDialog } from '@/features/campaign/components/delete-campaign-dialog';
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
  ...CampaignStatusSchema.options.map((status) => ({ value: status, label: status })),
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
  const [createOpen, setCreateOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign>();
  const [deletingCampaign, setDeletingCampaign] = useState<Campaign>();
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
    <div className="flex max-w-7xl flex-col gap-4">
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

        <Button onClick={() => setCreateOpen(true)}>新增</Button>
      </div>

      <CampaignFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
      />

      <CampaignFormDialog
        open={editingCampaign !== null && editingCampaign !== undefined}
        campaign={editingCampaign}
        onOpenChange={(open) => {
          if (!open) setEditingCampaign(undefined);
        }}
      />

      <DeleteCampaignDialog
        open={deletingCampaign !== null && deletingCampaign !== undefined}
        campaign={deletingCampaign}
        onOpenChange={(open) => {
          if (!open) setDeletingCampaign(undefined);
        }}
      />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>名稱</TableHead>
            <TableHead>廣告主</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>預算</TableHead>
            <TableHead>起訖日期</TableHead>
            <TableHead>操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isPending && (
            <TableRow>
              <TableCell
                colSpan={6}
                className="text-muted-foreground h-24 text-center"
              >
                載入中…
              </TableCell>
            </TableRow>
          )}
          {isEmpty && (
            <TableRow>
              <TableCell
                colSpan={6}
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
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingCampaign(campaign)}
                  >
                    編輯
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setDeletingCampaign(campaign)}
                  >
                    刪除
                  </Button>
                </div>
              </TableCell>
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
