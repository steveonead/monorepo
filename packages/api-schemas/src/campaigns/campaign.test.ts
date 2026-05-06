import { describe, expect, it } from 'vitest';

import {
  CampaignDetailResponseSchema,
  CampaignListResponseSchema,
  CampaignSchema,
} from './campaign.js';

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
