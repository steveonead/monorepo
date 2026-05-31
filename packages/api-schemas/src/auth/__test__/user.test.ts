import { describe, expect, it } from 'vitest';

import { CreateUserInputSchema, UserResponseSchema, UserSchema } from '@/auth/user';

const validUser = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  email: 'user@example.com',
  name: 'Alice',
  role: 'user',
  createdAt: '2026-01-01',
};

describe('userSchema', () => {
  it('合法 user 通過 parse', () => {
    const result = UserSchema.safeParse(validUser);
    expect(result.success).toBe(true);
  });

  it('createdAt 字串被 coerce 成 Date', () => {
    const result = UserSchema.safeParse(validUser);
    if (!result.success) throw new Error('parse failed');
    expect(result.data.createdAt).toBeInstanceOf(Date);
  });

  it('格式錯誤的 email 被拒絕', () => {
    const result = UserSchema.safeParse({ ...validUser, email: 'not-an-email' });
    expect(result.success).toBe(false);
  });

  it('空字串的 name 被拒絕', () => {
    const result = UserSchema.safeParse({ ...validUser, name: '' });
    expect(result.success).toBe(false);
  });

  it('非 enum 值的 role 被拒絕', () => {
    const result = UserSchema.safeParse({ ...validUser, role: 'superadmin' });
    expect(result.success).toBe(false);
  });
});

describe('createUserInputSchema', () => {
  it('外部傳入的 role 被剝除，避免特權提升', () => {
    const result = CreateUserInputSchema.parse({
      email: 'new@example.com',
      name: 'Bob',
      role: 'admin',
    });
    expect(result).not.toHaveProperty('role');
  });
});

describe('userResponseSchema', () => {
  it('success 形式的回應通過 parse', () => {
    const data = UserSchema.parse(validUser);
    const result = UserResponseSchema.safeParse({ status: 'success', data });
    expect(result.success).toBe(true);
  });

  it('error 形式的回應被拒絕，錯誤一律走 HTTP status 與 exception filter', () => {
    const result = UserResponseSchema.safeParse({ status: 'error', message: '出錯了' });
    expect(result.success).toBe(false);
  });
});
