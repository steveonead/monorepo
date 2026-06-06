import type { LoginInput, LoginResponse } from '@superdsp/api-schemas/auth/login';

import { Injectable, UnauthorizedException } from '@nestjs/common';

const HARDCODED_EMAIL = 'admin@superdsp.com';
const HARDCODED_PASSWORD = 'Gsp123456';
const SESSION_TOKEN = 'superdsp-session-token';

@Injectable()
export class AuthService {
  login({ email, password }: LoginInput): LoginResponse {
    if (email !== HARDCODED_EMAIL || password !== HARDCODED_PASSWORD) {
      throw new UnauthorizedException('帳號或密碼錯誤');
    }
    return { token: SESSION_TOKEN };
  }
}
