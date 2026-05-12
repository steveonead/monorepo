import { NestFactory } from '@nestjs/core';
import { ZodSerializerInterceptor, ZodValidationPipe } from 'nestjs-zod';
import process from 'node:process';

import { AppModule } from '@/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ZodValidationPipe());
  app.useGlobalInterceptors(new ZodSerializerInterceptor());
  app.enableCors();
  app.enableShutdownHooks();
  await app.listen(process.env.PORT ?? 5012);
}

bootstrap();
