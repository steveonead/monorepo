import { z } from 'zod';

export const LoginSchema = z.object({
  email: z.email(),
  password: z.string().check(z.minLength(8), z.maxLength(100)),
});

export type LoginInput = z.infer<typeof LoginSchema>;
