import type { INestApplication } from '@nestjs/common';

import { HttpStatus, InternalServerErrorException } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { createZodValidationPipe, ZodSerializerInterceptor } from 'nestjs-zod';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { AuthModule } from '@/auth/auth.module';
import { AuthService } from '@/auth/auth.service';
import { AllExceptionsFilter } from '@/common/filters/all-exceptions.filter';
import { EnvSchema } from '@/config/env.schema';

const StrictZodValidationPipe = createZodValidationPipe({ strictSchemaDeclaration: true });

const baseProviders = [
  { provide: APP_PIPE, useClass: StrictZodValidationPipe },
  { provide: APP_INTERCEPTOR, useClass: ZodSerializerInterceptor },
  { provide: APP_FILTER, useClass: AllExceptionsFilter },
];

const configImport = ConfigModule.forRoot({
  isGlobal: true,
  validate: (config) => EnvSchema.parse(config),
});

async function createApp(): Promise<INestApplication> {
  const moduleRef = await Test.createTestingModule({
    imports: [configImport, AuthModule],
    providers: baseProviders,
  }).compile();

  const app = moduleRef.createNestApplication();
  await app.init();
  return app;
}

// 以 stub ConfigService 強制 production，驗證 filter 在 prod 是否隱藏內部細節（不依賴外部 NODE_ENV）。
async function createProdApp(login: () => never): Promise<INestApplication> {
  const moduleRef = await Test.createTestingModule({
    imports: [configImport, AuthModule],
    providers: baseProviders,
  })
    .overrideProvider(AuthService)
    .useValue({ login })
    .overrideProvider(ConfigService)
    .useValue({ get: (key: string) => (key === 'NODE_ENV' ? 'production' : undefined) })
    .compile();

  const app = moduleRef.createNestApplication();
  await app.init();
  return app;
}

describe('POST /auth/login', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('正確帳密回傳 201 與成功回應', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'admin@superdsp.com', password: 'Gsp123456' })
      .set('Accept', 'application/json');

    expect(res.status).toBe(HttpStatus.CREATED);
    expect(res.body).toMatchObject({ statusCode: 'SUCCESS', data: { token: expect.any(String) } });
    expect(res.body.data.token).toBeTruthy();
  });

  it('密碼錯誤回傳 401 與錯誤回應', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'admin@superdsp.com', password: 'WrongPassword' })
      .set('Accept', 'application/json');

    expect(res.status).toBe(HttpStatus.UNAUTHORIZED);
    expect(res.body).toMatchObject({ statusCode: 'UNAUTHORIZED', message: expect.any(String) });
  });

  it('帳號錯誤回傳 401 與錯誤回應', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'wrong@superdsp.com', password: 'Gsp123456' })
      .set('Accept', 'application/json');

    expect(res.status).toBe(HttpStatus.UNAUTHORIZED);
    expect(res.body).toMatchObject({ statusCode: 'UNAUTHORIZED', message: expect.any(String) });
  });

  it('密碼不足 8 字元回傳 400 與含 path 的驗證訊息', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'admin@superdsp.com', password: 'short' })
      .set('Accept', 'application/json');

    expect(res.status).toBe(HttpStatus.BAD_REQUEST);
    expect(res.body).toMatchObject({
      statusCode: 'VALIDATION_ERROR',
      message: expect.any(String),
    });
    expect(res.body.message).toContain('password');
  });
});

describe('POST /auth/login 未預期錯誤', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [configImport, AuthModule],
      providers: baseProviders,
    })
      .overrideProvider(AuthService)
      .useValue({
        login: () => {
          throw new Error('boom');
        },
      })
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('非 HttpException 例外回傳 500 與 INTERNAL_SERVER_ERROR 錯誤回應', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'admin@superdsp.com', password: 'Gsp123456' })
      .set('Accept', 'application/json');

    expect(res.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(res.body).toMatchObject({ statusCode: 'INTERNAL_SERVER_ERROR' });
    expect(res.body.message).toContain('boom');
  });
});

describe('POST /auth/login production 模式不洩漏內部錯誤細節', () => {
  it('非 HttpException 例外回 500 且 message 為固定字串，不含原始錯誤內容', async () => {
    const app = await createProdApp(() => {
      throw new Error('db secret boom');
    });

    try {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'admin@superdsp.com', password: 'Gsp123456' })
        .set('Accept', 'application/json');

      expect(res.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(res.body).toMatchObject({
        statusCode: 'INTERNAL_SERVER_ERROR',
        message: 'Internal server error',
      });
      expect(res.body.message).not.toContain('boom');
    } finally {
      await app.close();
    }
  });

  it('5xx HttpException 回 500 且不洩漏 exception 挾帶的內部 message', async () => {
    const app = await createProdApp(() => {
      throw new InternalServerErrorException('db connection failed at host 10.0.0.5');
    });

    try {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'admin@superdsp.com', password: 'Gsp123456' })
        .set('Accept', 'application/json');

      expect(res.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(res.body).toMatchObject({
        statusCode: 'INTERNAL_SERVER_ERROR',
        message: 'Internal server error',
      });
      expect(res.body.message).not.toContain('10.0.0.5');
    } finally {
      await app.close();
    }
  });
});
