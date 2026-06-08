import { describe, expect, it } from 'vitest';

import { ok, partialOk } from '@/common/utils/api-response';

describe('ok', () => {
  it('將 data 包成 statusCode 為 SUCCESS 的回應', () => {
    const result = ok({ a: 1 });
    expect(result.statusCode).toBe('SUCCESS');
    expect(result.data).toEqual({ a: 1 });
    expect(result.message).toBeUndefined();
  });

  it('data 為 null 時仍回傳 SUCCESS 回應且 data 為 null', () => {
    const result = ok(null);
    expect(result.statusCode).toBe('SUCCESS');
    expect(result.data).toBeNull();
  });

  it('傳入 message 時一併帶入回應', () => {
    const result = ok({ a: 1 }, '建立成功');
    expect(result.message).toBe('建立成功');
  });
});

describe('partialOk', () => {
  it('將 data 包成 statusCode 為 PARTIAL_SUCCESS 的回應', () => {
    const result = partialOk({ a: 1 }, '部分成功');
    expect(result.statusCode).toBe('PARTIAL_SUCCESS');
    expect(result.data).toEqual({ a: 1 });
    expect(result.message).toBe('部分成功');
  });
});
