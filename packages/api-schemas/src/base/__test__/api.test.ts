import { describe, expect, it } from 'vitest';
import { z } from 'zod';

import { createSuccessResponseSchema, ErrorResponseSchema } from '@/base/api';

const ItemSchema = z.object({ id: z.number() });

describe('createSuccessResponseSchema', () => {
  it('合法 SUCCESS 回應通過 parse', () => {
    const schema = createSuccessResponseSchema(ItemSchema);
    const result = schema.safeParse({ statusCode: 'SUCCESS', data: { id: 1 } });
    expect(result.success).toBe(true);
  });

  it('帶 message 的 PARTIAL_SUCCESS 回應通過 parse', () => {
    const schema = createSuccessResponseSchema(ItemSchema);
    const result = schema.safeParse({
      statusCode: 'PARTIAL_SUCCESS',
      data: { id: 1 },
      message: '部分成功',
    });
    expect(result.success).toBe(true);
  });

  it('statusCode 不在 success 列舉內時被拒絕', () => {
    const schema = createSuccessResponseSchema(ItemSchema);
    const result = schema.safeParse({ statusCode: 'UNAUTHORIZED', data: { id: 1 } });
    expect(result.success).toBe(false);
  });

  it('data 不符 inner schema 時被拒絕', () => {
    const schema = createSuccessResponseSchema(ItemSchema);
    const result = schema.safeParse({ statusCode: 'SUCCESS', data: { id: 'not-a-number' } });
    expect(result.success).toBe(false);
  });
});

describe('errorResponseSchema', () => {
  it('只有 statusCode 的 error 回應通過 parse', () => {
    const result = ErrorResponseSchema.safeParse({ statusCode: 'UNAUTHORIZED' });
    expect(result.success).toBe(true);
  });

  it('帶 message 的 error 回應通過 parse', () => {
    const result = ErrorResponseSchema.safeParse({
      statusCode: 'VALIDATION_ERROR',
      message: '驗證失敗',
    });
    expect(result.success).toBe(true);
  });

  it('statusCode 不在 error 列舉內時被拒絕', () => {
    const result = ErrorResponseSchema.safeParse({ statusCode: 'SUCCESS' });
    expect(result.success).toBe(false);
  });
});
