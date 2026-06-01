import type { Campaign } from '@superdsp/api-schemas/campaigns/campaign';
import type { AnyFieldApi } from '@tanstack/react-form';

import { Calendar01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { CampaignStatusSchema } from '@superdsp/api-schemas/campaigns/campaign';
import { useForm } from '@tanstack/react-form';
import { zhTW } from 'date-fns/locale';
import { isNil, isNotNil } from 'es-toolkit';
import { useState } from 'react';

import type { CampaignFormValues } from '@/features/campaign/lib/campaign-form-schema';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { campaignFormSchema } from '@/features/campaign/lib/campaign-form-schema';
import { useCreateCampaign } from '@/features/campaign/queries/use-create-campaign';
import { useUpdateCampaign } from '@/features/campaign/queries/use-update-campaign';
import { cn } from '@/lib/utils';

const STATUS_ITEMS = CampaignStatusSchema.options.map((status) => ({
  value: status,
  label: status,
}));

const labelClass = 'mb-1.5 block text-sm font-medium';

// 列表日期採 UTC 顯示，這裡轉回 date input 的 YYYY-MM-DD 也用 UTC，避免時區位移
function toDateInputValue(date: Date) {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Calendar 以本地時間運作：字串 ⇄ Date 一律用本地年月日拆解／組裝，
// 確保選到的那天與表單字串完全一致，不因時區位移而前後跳一天。
function parseDateInputValue(value: string): Date | undefined {
  const [year, month, day] = value.split('-');
  if (!year || !month || !day) return undefined;
  return new Date(Number(year), Number(month) - 1, Number(day));
}

function fromCalendarDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function toFormValues(campaign?: Campaign): CampaignFormValues {
  if (!campaign) {
    return {
      name: '',
      advertiserName: '',
      status: 'DRAFT',
      startDate: '',
      endDate: '',
      budgetTwd: '',
    };
  }
  return {
    name: campaign.name,
    advertiserName: campaign.advertiserName,
    status: campaign.status,
    startDate: toDateInputValue(campaign.startDate),
    endDate: campaign.endDate ? toDateInputValue(campaign.endDate) : '',
    budgetTwd: isNil(campaign.budgetTwd) ? '' : String(campaign.budgetTwd),
  };
}

type CampaignFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // 帶入則為編輯模式（預填現有資料），未帶則為新增
  campaign?: Campaign;
};

export function CampaignFormDialog({ open, onOpenChange, campaign }: CampaignFormDialogProps) {
  // 關閉時 parent 會同時將 campaign 清為 undefined，但退場動畫期間 DialogContent
  // 仍掛載；保留最後一筆 campaign，避免標題、欄位與按鈕短暫翻成新增模式而閃爍。
  const [displayed, setDisplayed] = useState(campaign);
  if (isNotNil(campaign) && campaign !== displayed) {
    setDisplayed(campaign);
  }

  const isEdit = isNotNil(displayed);
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? '編輯 campaign' : '新增 campaign'}</DialogTitle>
          <DialogDescription>
            {isEdit ? '修改 campaign 資料後更新。' : '填寫 campaign 資料後建立。'}
          </DialogDescription>
        </DialogHeader>
        <CampaignForm
          key={displayed?.id ?? 'create'}
          campaign={displayed}
          onSuccess={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

function FieldError({ field }: { field: AnyFieldApi }) {
  if (field.state.meta.errors.length === 0) return null;
  return (
    <p
      id={`${field.name}-error`}
      className="text-destructive mt-1.5 text-xs"
    >
      {field.state.meta.errors.map((err) => err?.message).join(', ')}
    </p>
  );
}

function TextField({
  field,
  label,
  type = 'text',
}: {
  field: AnyFieldApi;
  label: string;
  type?: 'text' | 'number';
}) {
  const hasError = field.state.meta.errors.length > 0;
  return (
    <div>
      <label
        htmlFor={field.name}
        className={labelClass}
      >
        {label}
      </label>
      <Input
        id={field.name}
        name={field.name}
        type={type}
        value={field.state.value as string}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
        aria-invalid={hasError}
        aria-describedby={hasError ? `${field.name}-error` : undefined}
      />
      <FieldError field={field} />
    </div>
  );
}

function DateField({ field, label }: { field: AnyFieldApi; label: string }) {
  const [open, setOpen] = useState(false);
  const hasError = field.state.meta.errors.length > 0;
  const value = field.state.value as string;
  const selected = parseDateInputValue(value);

  return (
    <div>
      <label
        htmlFor={field.name}
        className={labelClass}
      >
        {label}
      </label>
      <Popover
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          // 關閉即視為離開欄位，與 TextField 的 onBlur 行為對齊
          if (!next) field.handleBlur();
        }}
      >
        <PopoverTrigger
          render={
            <Button
              id={field.name}
              variant="outline"
              className={cn(
                'w-full justify-start text-left font-normal',
                !value && 'text-muted-foreground',
              )}
              aria-invalid={hasError}
              aria-describedby={hasError ? `${field.name}-error` : undefined}
            >
              <HugeiconsIcon icon={Calendar01Icon} />
              {value || '選擇日期'}
            </Button>
          }
        />
        <PopoverContent
          align="start"
          className="w-auto p-0"
        >
          <Calendar
            autoFocus
            locale={zhTW}
            mode="single"
            selected={selected}
            defaultMonth={selected}
            onSelect={(date) => {
              field.handleChange(date ? fromCalendarDate(date) : '');
              setOpen(false);
            }}
          />
        </PopoverContent>
      </Popover>
      <FieldError field={field} />
    </div>
  );
}

function CampaignForm({ campaign, onSuccess }: { campaign?: Campaign; onSuccess: () => void }) {
  const createCampaign = useCreateCampaign();
  const updateCampaign = useUpdateCampaign();
  const isPending = createCampaign.isPending || updateCampaign.isPending;

  const form = useForm({
    defaultValues: toFormValues(campaign),
    onSubmit: async ({ value }) => {
      const payload = campaignFormSchema.parse(value);
      if (campaign) {
        await updateCampaign.mutateAsync({ id: campaign.id, data: payload });
      } else {
        await createCampaign.mutateAsync(payload);
      }
      onSuccess();
    },
  });

  return (
    <form
      noValidate
      className="flex flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        void form.handleSubmit();
      }}
    >
      <form.Field
        name="name"
        validators={{ onSubmit: campaignFormSchema.shape.name }}
      >
        {(field) => (
          <TextField
            field={field}
            label="名稱"
          />
        )}
      </form.Field>

      <form.Field
        name="advertiserName"
        validators={{ onSubmit: campaignFormSchema.shape.advertiserName }}
      >
        {(field) => (
          <TextField
            field={field}
            label="廣告主"
          />
        )}
      </form.Field>

      <form.Field
        name="status"
        validators={{ onSubmit: campaignFormSchema.shape.status }}
      >
        {(field) => (
          <div>
            <label className={labelClass}>Status</label>
            <Select
              items={STATUS_ITEMS}
              value={field.state.value}
              onValueChange={(value) => field.handleChange(value as Campaign['status'])}
            >
              <SelectTrigger
                className="w-full"
                aria-label="Status"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {STATUS_ITEMS.map((item) => (
                    <SelectItem
                      key={item.value}
                      value={item.value}
                    >
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        )}
      </form.Field>

      <form.Field
        name="startDate"
        validators={{ onSubmit: campaignFormSchema.shape.startDate }}
      >
        {(field) => (
          <DateField
            field={field}
            label="開始日期"
          />
        )}
      </form.Field>

      <form.Field
        name="endDate"
        validators={{ onSubmit: campaignFormSchema.shape.endDate }}
      >
        {(field) => (
          <DateField
            field={field}
            label="結束日期（可留空）"
          />
        )}
      </form.Field>

      <form.Field
        name="budgetTwd"
        validators={{ onSubmit: campaignFormSchema.shape.budgetTwd }}
      >
        {(field) => (
          <TextField
            field={field}
            label="預算（可留空）"
            type="number"
          />
        )}
      </form.Field>

      <DialogFooter>
        <DialogClose render={<Button variant="outline">取消</Button>} />
        <Button
          type="submit"
          disabled={isPending}
        >
          {campaign ? '更新' : '建立'}
        </Button>
      </DialogFooter>
    </form>
  );
}
