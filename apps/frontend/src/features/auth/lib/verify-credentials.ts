import type { LoginInput } from '@superdsp/api-schemas/auth/login';

/**
 * 純前端 hardcode 帳密（PRD Out of Scope：無後端身份驗證）。
 * 後續若接後端 JWT，移除此常數並改為 API 比對。
 */
const HARDCODED_CREDENTIALS = {
  email: 'admin@superdsp.com',
  password: 'superdsp2025',
} as const;

export function verifyCredentials({ email, password }: LoginInput): boolean {
  return email === HARDCODED_CREDENTIALS.email && password === HARDCODED_CREDENTIALS.password;
}
