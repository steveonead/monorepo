import { z } from 'zod';

import { ApiSuccessResponseSchemaFactory } from '../base/api';

export const UserSchema = z.object({
  id: z.uuid(),
  email: z.email(),
  name: z.string().check(z.minLength(1), z.maxLength(100)),
  role: z.enum(['admin', 'user', 'guest']),
  createdAt: z.coerce.date(),
});

export type User = z.infer<typeof UserSchema>;

export const CreateUserSchema = UserSchema.omit({ id: true, createdAt: true });
export type CreateUserInput = z.infer<typeof CreateUserSchema>;

export const GetUserResponseSchema = ApiSuccessResponseSchemaFactory(UserSchema);
export type GetUserResponse = z.infer<typeof GetUserResponseSchema>;
