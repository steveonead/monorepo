import { Body, Controller, Post } from '@nestjs/common';
import { ZodResponse } from 'nestjs-zod';

import { AuthService } from '@/auth/auth.service';
import { LoginDto, LoginResponseDto } from '@/auth/dto/auth.dto';
import { ok } from '@/common/utils/api-response';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ZodResponse({ type: LoginResponseDto })
  login(@Body() dto: LoginDto) {
    return ok(this.authService.login(dto));
  }
}
