import { describe, expect, it } from 'vitest';

import { getErrorCode } from '@/base/error-codes';

describe('getErrorCode', () => {
  it('已知狀態碼回傳對應 error code', () => {
    expect(getErrorCode(400)).toBe('VALIDATION_ERROR');
    expect(getErrorCode(401)).toBe('UNAUTHORIZED');
    expect(getErrorCode(403)).toBe('FORBIDDEN');
    expect(getErrorCode(404)).toBe('NOT_FOUND');
    expect(getErrorCode(409)).toBe('CONFLICT');
    expect(getErrorCode(422)).toBe('UNPROCESSABLE_ENTITY');
    expect(getErrorCode(500)).toBe('INTERNAL_SERVER_ERROR');
  });

  it('未知狀態碼回傳 ERROR fallback', () => {
    expect(getErrorCode(418)).toBe('UNKNOWN_ERROR');
    expect(getErrorCode(999)).toBe('UNKNOWN_ERROR');
    expect(getErrorCode(-500)).toBe('UNKNOWN_ERROR');
    expect(getErrorCode(1_000)).toBe('UNKNOWN_ERROR');
  });
});
