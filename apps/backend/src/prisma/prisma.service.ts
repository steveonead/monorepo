import type { OnModuleDestroy } from '@nestjs/common';

import { Injectable } from '@nestjs/common';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from '@prisma/client/extension';
import process from 'node:process';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleDestroy {
  constructor() {
    const url = process.env.DATABASE_URL;
    if (!url) {
      throw new Error('DATABASE_URL is not set');
    }
    super({ adapter: new PrismaMariaDb(url) });
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
