import { useQuery } from '@tanstack/react-query';

import { userQueryOption } from '@/features/auth/queries/user';

export function useUser(userId: number) {
  return useQuery({
    ...userQueryOption(userId),
    select: (data) => (data.status === 'success' ? data.data.name : undefined),
  });
}
