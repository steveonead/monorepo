import type { OnModuleDestroy } from '@nestjs/common';

import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleDestroy {
  constructor() {
    super({ datasourceUrl: process.env.DATABASE_URL });
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
