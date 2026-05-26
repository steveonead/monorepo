import { NestFactory } from '@nestjs/core';
import process from 'node:process';

import { AppModule } from '@/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.enableShutdownHooks();
  await app.listen(process.env.PORT ?? 5012);
}

bootstrap();
