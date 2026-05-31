import type {
  CampaignDetailResponse,
  CampaignListResponse,
} from '@superdsp/api-schemas/campaigns/campaign';

import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Query } from '@nestjs/common';
import {
  CampaignDetailResponseSchema,
  CampaignListQuerySchema,
  CampaignListResponseSchema,
  CreateCampaignSchema,
  UpdateCampaignSchema,
} from '@superdsp/api-schemas/campaigns/campaign';
import { createZodDto, ZodSerializerDto } from 'nestjs-zod';

import { CampaignService } from '@/campaign/campaign.service';
import { CampaignIdParamDto } from '@/campaign/dto/campaign-id-param.dto';

class CreateCampaignDto extends createZodDto(CreateCampaignSchema) {}
class UpdateCampaignDto extends createZodDto(UpdateCampaignSchema) {}
class CampaignListQueryDto extends createZodDto(CampaignListQuerySchema) {}
class CampaignListResponseDto extends createZodDto(CampaignListResponseSchema) {}
class CampaignDetailResponseDto extends createZodDto(CampaignDetailResponseSchema) {}

@Controller('campaigns')
export class CampaignController {
  constructor(private readonly campaignService: CampaignService) {}

  @Get()
  @ZodSerializerDto(CampaignListResponseDto)
  findAll(@Query() query: CampaignListQueryDto): CampaignListResponse {
    return { status: 'success', data: this.campaignService.findAll(query) };
  }

  @Post()
  @ZodSerializerDto(CampaignDetailResponseDto)
  create(@Body() dto: CreateCampaignDto): CampaignDetailResponse {
    return { status: 'success', data: this.campaignService.create(dto) };
  }

  @Patch(':id')
  @ZodSerializerDto(CampaignDetailResponseDto)
  update(
    @Param() param: CampaignIdParamDto,
    @Body() dto: UpdateCampaignDto,
  ): CampaignDetailResponse {
    return { status: 'success', data: this.campaignService.update(param.id, dto) };
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param() param: CampaignIdParamDto): void {
    this.campaignService.remove(param.id);
  }
}
