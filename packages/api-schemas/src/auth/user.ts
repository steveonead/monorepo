import { z } from 'zod';

import { createApiSuccessSchema } from '@/base/api';

export const UserSchema = z
  .object({
    id: z.uuid(),
    email: z.email(),
    name: z.string().check(z.minLength(1), z.maxLength(100)),
    role: z.enum(['admin', 'user', 'guest']),
    createdAt: z.coerce.date(),
  })
  .meta({ id: 'User' });
export type User = z.infer<typeof UserSchema>;

export const CreateUserSchema = UserSchema.omit({ id: true, createdAt: true });
export type CreateUser = z.infer<typeof CreateUserSchema>;

// 外部建立使用者的輸入移除 role，避免呼叫端自設特權，role 一律由 server 指派
export const CreateUserInputSchema = CreateUserSchema.omit({ role: true });
export type CreateUserInput = z.infer<typeof CreateUserInputSchema>;

export const UserResponseSchema = createApiSuccessSchema(UserSchema);
export type UserResponse = z.infer<typeof UserResponseSchema>;
