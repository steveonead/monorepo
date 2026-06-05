import { CreateUserInputSchema, UserSchema } from '@superdsp/api-schemas/auth/user';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export class CreateUserDto extends createZodDto(CreateUserInputSchema) {}
export class UserDto extends createZodDto(UserSchema) {}
export class UserListDto extends createZodDto(z.array(UserSchema)) {}
