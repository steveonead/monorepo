import type { CreateCampaign } from '@superdsp/api-schemas/campaigns/campaign';

import { BadRequestException } from '@nestjs/common';
import { beforeEach, describe, expect, it } from 'vitest';

import { CampaignService } from '@/campaign/campaign.service';

describe('campaignService', () => {
  let service: CampaignService;

  beforeEach(() => {
    service = new CampaignService();
  });

  const validInput: CreateCampaign = {
    name: 'Test Campaign',
    status: 'ACTIVE',
    advertiserName: 'Acme',
    startDate: '2026-06-01T00:00:00.000Z',
    endDate: '2026-08-31T00:00:00.000Z',
  };

  describe('create', () => {
    it('endDate 早於 startDate 時拋出 BadRequestException', () => {
      expect(() => service.create({ ...validInput, endDate: '2026-05-01T00:00:00.000Z' })).toThrow(
        BadRequestException,
      );
    });

    it('endDate 晚於 startDate 時成功建立', () => {
      const result = service.create(validInput);
      expect(result.id).toEqual(expect.any(String));
    });

    it('endDate 等於 startDate 時成功建立', () => {
      const result = service.create({ ...validInput, endDate: validInput.startDate });
      expect(result.id).toEqual(expect.any(String));
    });

    it('endDate 為 null 時成功建立', () => {
      const result = service.create({ ...validInput, endDate: null });
      expect(result.endDate).toBeNull();
    });
  });

  describe('update', () => {
    it('合併後 endDate 早於 startDate 時拋出 BadRequestException', () => {
      const created = service.create(validInput);
      expect(() => service.update(created.id, { endDate: '2026-05-01T00:00:00.000Z' })).toThrow(
        BadRequestException,
      );
    });

    it('合併後日期順序合法時成功更新', () => {
      const created = service.create(validInput);
      const updated = service.update(created.id, { endDate: '2026-12-31T00:00:00.000Z' });
      expect(updated.endDate).toEqual('2026-12-31T00:00:00.000Z');
    });
  });
});
