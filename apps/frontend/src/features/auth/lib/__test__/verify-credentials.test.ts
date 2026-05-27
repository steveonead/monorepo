import { describe, expect, it } from 'vitest';

import { verifyCredentials } from '@/features/auth/lib/verify-credentials.ts';

describe('verifyCredentials', () => {
  it('帳號與密碼完全相符時回傳 true', () => {
    expect(verifyCredentials({ email: 'admin@superdsp.com', password: 'superdsp2025' })).toBe(true);
  });

  it('密碼不符時回傳 false', () => {
    expect(verifyCredentials({ email: 'admin@superdsp.com', password: 'wrong-password' })).toBe(
      false,
    );
  });

  it('帳號不符時回傳 false', () => {
    expect(verifyCredentials({ email: 'someone@other.com', password: 'superdsp2025' })).toBe(false);
  });
});
