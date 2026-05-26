import { Module } from '@nestjs/common';

import { CampaignController } from '@/campaign/campaign.controller';
import { CampaignService } from '@/campaign/campaign.service';

@Module({
  controllers: [CampaignController],
  providers: [CampaignService],
})
export class CampaignModule {}
