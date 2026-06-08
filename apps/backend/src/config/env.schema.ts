import { z } from 'zod';

export const EnvSchema = z.object({
  PORT: z.coerce.number().default(5012),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('production'),
});

export type Env = z.infer<typeof EnvSchema>;
