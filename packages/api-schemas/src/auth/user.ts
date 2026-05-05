import { z } from 'zod';

import { createResponseSchema } from '@/base/api';

export const UserSchema = z.object({
  id: z.uuid(),
  email: z.email(),
  name: z.string().check(z.minLength(1), z.maxLength(100)),
  role: z.enum(['admin', 'user', 'guest']),
  createdAt: z.iso.date(),
});

export const CreateUserSchema = UserSchema.omit({ id: true, createdAt: true });

export const UserResponseSchema = createResponseSchema(UserSchema);

export type User = z.infer<typeof UserSchema>;
export type CreateUser = z.infer<typeof CreateUserSchema>;
export type UserResponse = z.infer<typeof UserResponseSchema>;
