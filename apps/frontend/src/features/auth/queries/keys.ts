import { createQueryKeys } from '@/lib/tanstack/query-keys';

export const authKeys = createQueryKeys('auth', {
  user: (userId: number) => [userId],
});
