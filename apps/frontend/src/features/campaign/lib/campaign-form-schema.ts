import type { Campaign } from '@superdsp/api-schemas/campaigns/campaign';

import { CampaignStatusSchema } from '@superdsp/api-schemas/campaigns/campaign';
import { z } from 'zod';

// 表單欄位皆為字串輸入（input 一律 string，才能同時當 per-field 與整體 validator）。
// 透過 transform 轉成 API 需要的型別，輸出等同 CreateCampaign，可直接餵給 mutation。
export const campaignFormSchema = z.object({
  name: z.string().min(1, '請輸入名稱').max(100, '名稱不得超過 100 個字元'),
  advertiserName: z.string().min(1, '請輸入廣告主'),
  status: CampaignStatusSchema,
  startDate: z
    .string()
    .min(1, '請選擇開始日期')
    .transform((value) => new Date(value)),
  endDate: z.string().transform((value) => (value === '' ? null : new Date(value))),
  budgetTwd: z
    .string()
    .refine(
      (value) => value === '' || (Number.isInteger(Number(value)) && Number(value) > 0),
      '預算需為正整數',
    )
    .transform((value) => (value === '' ? undefined : Number(value))),
});

export type CampaignFormPayload = z.output<typeof campaignFormSchema>;

// 表單元件持有的原始字串狀態（送出時才透過 schema 轉成 payload）
export type CampaignFormValues = {
  name: string;
  advertiserName: string;
  status: Campaign['status'];
  startDate: string;
  endDate: string;
  budgetTwd: string;
};
