import { describe, expect, it } from 'vitest';
import { z } from 'zod';

import { ApiErrorSchema, createApiResponseSchema, createApiSuccessSchema } from '@/base/api';

const ItemSchema = z.object({ id: z.number() });

describe('createApiSuccessSchema', () => {
  it('合法 success 回應通過 parse', () => {
    const schema = createApiSuccessSchema(ItemSchema);
    const result = schema.safeParse({ status: 'success', data: { id: 1 } });
    expect(result.success).toBe(true);
  });

  it('status 為 error 時被拒絕', () => {
    const schema = createApiSuccessSchema(ItemSchema);
    const result = schema.safeParse({ status: 'error', message: '壞了' });
    expect(result.success).toBe(false);
  });
});

describe('apiErrorSchema', () => {
  it('缺少 code 時被拒絕', () => {
    const result = ApiErrorSchema.safeParse({ status: 'error', message: '發生錯誤' });
    expect(result.success).toBe(false);
  });

  it('合法 error 回應通過 parse', () => {
    const result = ApiErrorSchema.safeParse({
      status: 'error',
      code: 'INTERNAL_SERVER_ERROR',
      message: '發生錯誤',
    });
    expect(result.success).toBe(true);
  });

  it('含 errors array 的 error 回應通過 parse', () => {
    const result = ApiErrorSchema.safeParse({
      status: 'error',
      code: 'VALIDATION_ERROR',
      message: '驗證失敗',
      errors: [{ path: 'email', message: '格式不正確' }],
    });
    expect(result.success).toBe(true);
  });

  it('errors[].path 接受 string 或 number 陣列', () => {
    const result = ApiErrorSchema.safeParse({
      status: 'error',
      code: 'VALIDATION_ERROR',
      message: '驗證失敗',
      errors: [{ path: ['user', 0, 'email'], message: '格式不正確' }],
    });
    expect(result.success).toBe(true);
  });

  it('errors array item 缺少 path 時被拒絕', () => {
    const result = ApiErrorSchema.safeParse({
      status: 'error',
      code: 'VALIDATION_ERROR',
      message: '驗證失敗',
      errors: [{ message: '格式不正確' }],
    });
    expect(result.success).toBe(false);
  });
});

describe('createApiResponseSchema', () => {
  const ResponseSchema = createApiResponseSchema(ItemSchema);

  it('success shape 通過 parse', () => {
    const result = ResponseSchema.safeParse({ status: 'success', data: { id: 1 } });
    expect(result.success).toBe(true);
  });

  it('error shape 通過 parse', () => {
    const result = ResponseSchema.safeParse({
      status: 'error',
      code: 'INTERNAL_SERVER_ERROR',
      message: '伺服器錯誤',
    });
    expect(result.success).toBe(true);
  });

  it('未知 status 被拒絕', () => {
    const result = ResponseSchema.safeParse({ status: 'pending', data: { id: 1 } });
    expect(result.success).toBe(false);
  });
});
