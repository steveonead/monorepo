import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { HealthModule } from '@/health/health.module';
import { UserModule } from '@/user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
    }),
    HealthModule,
    UserModule,
  ],
})
export class AppModule {}
