import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { createZodValidationPipe, ZodSerializerInterceptor } from 'nestjs-zod';

import { HttpExceptionFilter } from '@/common/filters/http-exception.filter';
import { EnvSchema } from '@/env.schema';
import { UserModule } from '@/user/user.module';

const StrictZodValidationPipe = createZodValidationPipe({
  strictSchemaDeclaration: true,
});

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
      validate: (config) => EnvSchema.parse(config),
    }),
    UserModule,
  ],
  providers: [
    { provide: APP_PIPE, useClass: StrictZodValidationPipe },
    { provide: APP_INTERCEPTOR, useClass: ZodSerializerInterceptor },
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
  ],
})
export class AppModule {}
