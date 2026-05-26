import type {
  Campaign,
  CampaignListQuery,
  CampaignListResponse,
  CreateCampaign,
  UpdateCampaign,
} from '@superdsp/api-schemas/campaigns/campaign';

import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';

@Injectable()
export class CampaignService {
  private readonly campaigns: Campaign[] = [
    {
      id: randomUUID(),
      name: 'Summer Sale',
      status: 'ACTIVE',
      advertiserName: 'Acme Corp',
      startDate: new Date('2026-06-01'),
      endDate: new Date('2026-08-31'),
      budgetTwd: 500000,
    },
    {
      id: randomUUID(),
      name: 'Winter Promo',
      status: 'ACTIVE',
      advertiserName: 'Globex',
      startDate: new Date('2026-12-01'),
      endDate: null,
      budgetTwd: 300000,
    },
    {
      id: randomUUID(),
      name: 'Spring Launch',
      status: 'ACTIVE',
      advertiserName: 'Initech',
      startDate: new Date('2026-03-01'),
      endDate: new Date('2026-04-30'),
    },
    {
      id: randomUUID(),
      name: 'Brand Awareness',
      status: 'PAUSED',
      advertiserName: 'Umbrella',
      startDate: new Date('2026-01-01'),
      endDate: null,
      budgetTwd: 120000,
    },
    {
      id: randomUUID(),
      name: 'Q3 Draft',
      status: 'DRAFT',
      advertiserName: 'Hooli',
      startDate: new Date('2026-07-01'),
      endDate: null,
    },
  ];

  findAll(query: CampaignListQuery): CampaignListResponse['data'] {
    const { page, pageSize, status } = query;
    const filtered = status ? this.campaigns.filter((c) => c.status === status) : this.campaigns;
    const start = (page - 1) * pageSize;
    const items = filtered.slice(start, start + pageSize);
    return { items, total: filtered.length, page, pageSize };
  }

  create(input: CreateCampaign): Campaign {
    const campaign: Campaign = { id: randomUUID(), ...input };
    this.campaigns.push(campaign);
    return campaign;
  }

  update(id: string, input: UpdateCampaign): Campaign {
    const index = this.findIndexOrThrow(id);
    const campaign: Campaign = Object.assign({}, this.campaigns[index], input);
    this.campaigns[index] = campaign;
    return campaign;
  }

  remove(id: string): void {
    const index = this.findIndexOrThrow(id);
    this.campaigns.splice(index, 1);
  }

  private findIndexOrThrow(id: string): number {
    const index = this.campaigns.findIndex((c) => c.id === id);
    if (index === -1) {
      throw new NotFoundException(`Campaign ${id} not found`);
    }
    return index;
  }
}
