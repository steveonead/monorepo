import { CreateUserInputSchema } from '@superdsp/api-schemas/auth/user';
import { createZodDto } from 'nestjs-zod';

export class CreateUserDto extends createZodDto(CreateUserInputSchema) {}
