import { LoginResponseSchema, LoginSchema } from '@superdsp/api-schemas/auth/login';
import { createZodDto } from 'nestjs-zod';

export class LoginDto extends createZodDto(LoginSchema) {}

export class LoginResponseDto extends createZodDto(LoginResponseSchema) {}
