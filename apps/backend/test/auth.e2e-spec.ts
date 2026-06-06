import type { INestApplication } from '@nestjs/common';

import { HttpStatus } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { createZodValidationPipe, ZodSerializerInterceptor } from 'nestjs-zod';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { AuthModule } from '@/auth/auth.module';
import { HttpExceptionFilter } from '@/common/filters/http-exception.filter';

const StrictZodValidationPipe = createZodValidationPipe({ strictSchemaDeclaration: true });

async function createApp(): Promise<INestApplication> {
  const moduleRef = await Test.createTestingModule({
    imports: [AuthModule],
    providers: [
      { provide: APP_PIPE, useClass: StrictZodValidationPipe },
      { provide: APP_INTERCEPTOR, useClass: ZodSerializerInterceptor },
      { provide: APP_FILTER, useClass: HttpExceptionFilter },
    ],
  }).compile();

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

  it('正確帳密回傳 201 與 token', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'admin@superdsp.com', password: 'Gsp123456' })
      .set('Accept', 'application/json');

    expect(res.status).toBe(HttpStatus.CREATED);
    expect(res.body).toMatchObject({ token: expect.any(String) });
    expect(res.body.token).toBeTruthy();
  });

  it('密碼錯誤回傳 401 與 ApiErrorResponse shape', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'admin@superdsp.com', password: 'WrongPassword' })
      .set('Accept', 'application/json');

    expect(res.status).toBe(HttpStatus.UNAUTHORIZED);
    expect(res.body).toMatchObject({
      status: 'error',
      code: 'UNAUTHORIZED',
      message: expect.any(String),
    });
  });

  it('帳號錯誤回傳 401 與 ApiErrorResponse shape', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'wrong@superdsp.com', password: 'Gsp123456' })
      .set('Accept', 'application/json');

    expect(res.status).toBe(HttpStatus.UNAUTHORIZED);
    expect(res.body).toMatchObject({
      status: 'error',
      code: 'UNAUTHORIZED',
      message: expect.any(String),
    });
  });

  it('密碼不足 8 字元回傳 400 與 errors 陣列', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'admin@superdsp.com', password: 'short' })
      .set('Accept', 'application/json');

    expect(res.status).toBe(HttpStatus.BAD_REQUEST);
    expect(res.body).toMatchObject({
      status: 'error',
      code: 'VALIDATION_ERROR',
      message: expect.any(String),
      errors: expect.arrayContaining([
        expect.objectContaining({ path: expect.anything(), message: expect.any(String) }),
      ]),
    });
  });
});
