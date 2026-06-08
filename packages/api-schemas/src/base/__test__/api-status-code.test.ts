import { describe, expect, it } from 'vitest';

import { getErrorCode } from '@/base/api-status-code';

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

  it('未對應的狀態碼 fallback 為 INTERNAL_SERVER_ERROR', () => {
    expect(getErrorCode(429)).toBe('INTERNAL_SERVER_ERROR');
    expect(getErrorCode(503)).toBe('INTERNAL_SERVER_ERROR');
    expect(getErrorCode(418)).toBe('INTERNAL_SERVER_ERROR');
  });
});
