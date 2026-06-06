import { describe, expect, it } from 'vitest';

import { LoginResponseSchema, LoginSchema } from '@/auth/login';

const validLogin = {
  email: 'user@example.com',
  password: 'password123',
};

describe('loginSchema', () => {
  it('合法的 email 與密碼通過 parse', () => {
    const result = LoginSchema.safeParse(validLogin);
    expect(result.success).toBe(true);
  });

  it('格式錯誤的 email 被拒絕', () => {
    const result = LoginSchema.safeParse({ ...validLogin, email: 'not-an-email' });
    expect(result.success).toBe(false);
  });

  it('少於 8 字元的密碼被拒絕', () => {
    const result = LoginSchema.safeParse({ ...validLogin, password: 'a'.repeat(7) });
    expect(result.success).toBe(false);
  });

  it('剛好 8 字元的密碼通過 parse', () => {
    const result = LoginSchema.safeParse({ ...validLogin, password: 'a'.repeat(8) });
    expect(result.success).toBe(true);
  });

  it('剛好 72 字元的密碼通過 parse', () => {
    const result = LoginSchema.safeParse({ ...validLogin, password: 'a'.repeat(72) });
    expect(result.success).toBe(true);
  });

  it('超過 72 字元的密碼被拒絕', () => {
    const result = LoginSchema.safeParse({ ...validLogin, password: 'a'.repeat(73) });
    expect(result.success).toBe(false);
  });
});

describe('loginResponseSchema', () => {
  it('token 字串通過 parse', () => {
    const result = LoginResponseSchema.safeParse({ token: 'superdsp-session-token' });
    expect(result.success).toBe(true);
  });

  it('token 非字串時被拒絕', () => {
    const result = LoginResponseSchema.safeParse({ token: 123 });
    expect(result.success).toBe(false);
  });

  it('缺少 token 欄位時被拒絕', () => {
    const result = LoginResponseSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});
