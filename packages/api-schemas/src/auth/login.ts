import { z } from 'zod';

export const LoginSchema = z.object({
  email: z.email({ error: '請輸入有效的電子郵件地址' }),
  password: z
    .string()
    .check(z.minLength(8, '密碼至少需要 8 個字元'), z.maxLength(72, '密碼不可超過 72 個字元')),
});

export type LoginInput = z.infer<typeof LoginSchema>;
