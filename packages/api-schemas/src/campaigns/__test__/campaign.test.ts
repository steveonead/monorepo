import { describe, expect, it } from 'vitest';

import {
  CampaignDetailResponseSchema,
  CampaignListQuerySchema,
  CampaignListResponseSchema,
  CampaignSchema,
  CreateCampaignSchema,
  UpdateCampaignSchema,
} from '@/campaigns/campaign';

const validCampaign = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  name: 'Summer Sale',
  status: 'ACTIVE',
  advertiserName: 'Acme Corp',
  startDate: '2026-01-01',
  endDate: '2026-06-30',
  budgetTwd: 50000,
};

describe('campaignSchema', () => {
  it('合法 campaign 通過 parse', () => {
    const result = CampaignSchema.safeParse(validCampaign);
    expect(result.success).toBe(true);
  });

  it('無效 status 被拒絕', () => {
    const result = CampaignSchema.safeParse({ ...validCampaign, status: 'INVALID' });
    expect(result.success).toBe(false);
  });

  it('空 name 被拒絕', () => {
    const result = CampaignSchema.safeParse({ ...validCampaign, name: '' });
    expect(result.success).toBe(false);
  });

  it('超過 100 字的 name 被拒絕', () => {
    const result = CampaignSchema.safeParse({ ...validCampaign, name: 'a'.repeat(101) });
    expect(result.success).toBe(false);
  });

  it('endDate 為 null 合法', () => {
    const result = CampaignSchema.safeParse({ ...validCampaign, endDate: null });
    expect(result.success).toBe(true);
  });

  it('budgetTwd 可省略', () => {
    const { budgetTwd: _, ...withoutBudget } = validCampaign;
    const result = CampaignSchema.safeParse(withoutBudget);
    expect(result.success).toBe(true);
  });

  it('budgetTwd 為 0 或負數被拒絕', () => {
    expect(CampaignSchema.safeParse({ ...validCampaign, budgetTwd: 0 }).success).toBe(false);
    expect(CampaignSchema.safeParse({ ...validCampaign, budgetTwd: -100 }).success).toBe(false);
  });

  it('日期字串被 coerce 成 Date', () => {
    const result = CampaignSchema.safeParse(validCampaign);
    if (!result.success) throw new Error('parse failed');
    expect(result.data.startDate).toBeInstanceOf(Date);
    expect(result.data.endDate).toBeInstanceOf(Date);
  });
});

describe('createCampaignSchema', () => {
  const { id: _, ...createInput } = validCampaign;

  it('不含 id 的合法輸入通過 parse', () => {
    const result = CreateCampaignSchema.safeParse(createInput);
    expect(result.success).toBe(true);
  });

  it('解析結果不包含 id 欄位', () => {
    const result = CreateCampaignSchema.parse({ ...createInput, id: validCampaign.id });
    expect(result).not.toHaveProperty('id');
  });

  it('超過 100 字的 name 被拒絕', () => {
    const result = CreateCampaignSchema.safeParse({ ...createInput, name: 'a'.repeat(101) });
    expect(result.success).toBe(false);
  });
});

describe('updateCampaignSchema', () => {
  const { id: _, ...fullInput } = validCampaign;

  it('全欄位齊全的輸入通過 parse', () => {
    const result = UpdateCampaignSchema.safeParse(fullInput);
    expect(result.success).toBe(true);
  });

  it('只含部分欄位的輸入通過 parse', () => {
    const result = UpdateCampaignSchema.safeParse({ name: 'Renamed' });
    expect(result.success).toBe(true);
  });

  it('partial 仍驗證有提供的欄位，name 超長被拒絕', () => {
    const result = UpdateCampaignSchema.safeParse({ name: 'a'.repeat(101) });
    expect(result.success).toBe(false);
  });
});

describe('campaignListQuerySchema', () => {
  it('空 query 套用預設 page=1、pageSize=20', () => {
    const result = CampaignListQuerySchema.parse({});
    expect(result.page).toBe(1);
    expect(result.pageSize).toBe(20);
  });

  it('字串數字被 coerce 成 number', () => {
    const result = CampaignListQuerySchema.parse({ page: '3', pageSize: '50' });
    expect(result.page).toBe(3);
    expect(result.pageSize).toBe(50);
  });

  it('status 可省略', () => {
    const result = CampaignListQuerySchema.parse({});
    expect(result.status).toBeUndefined();
  });

  it('合法 status 被保留', () => {
    const result = CampaignListQuerySchema.parse({ status: 'PAUSED' });
    expect(result.status).toBe('PAUSED');
  });

  it('page 為 0 或負數被拒絕', () => {
    expect(CampaignListQuerySchema.safeParse({ page: '0' }).success).toBe(false);
    expect(CampaignListQuerySchema.safeParse({ page: '-1' }).success).toBe(false);
  });

  it('pageSize 超過 100 被拒絕', () => {
    expect(CampaignListQuerySchema.safeParse({ pageSize: '101' }).success).toBe(false);
  });

  it('pageSize 剛好 100 通過 parse', () => {
    expect(CampaignListQuerySchema.safeParse({ pageSize: '100' }).success).toBe(true);
  });
});

describe('campaignDetailResponseSchema', () => {
  it('包上 success wrapper 後通過 parse', () => {
    const parsed = CampaignSchema.parse(validCampaign);
    const result = CampaignDetailResponseSchema.safeParse({ status: 'success', data: parsed });
    expect(result.success).toBe(true);
  });
});

describe('campaignListResponseSchema', () => {
  it('含 items、total、page、pageSize', () => {
    const parsed = CampaignSchema.parse(validCampaign);
    const result = CampaignListResponseSchema.safeParse({
      status: 'success',
      data: { items: [parsed], total: 1, page: 1, pageSize: 20 },
    });
    expect(result.success).toBe(true);
  });
});
