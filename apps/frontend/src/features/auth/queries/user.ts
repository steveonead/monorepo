import { UserResponseSchema } from '@superdsp/api-schemas/auth/user';
import { queryOptions } from '@tanstack/react-query';

import { sendRequest } from '@/lib/axios';

export function userQueryOption(userId: number) {
  return queryOptions({
    queryKey: ['user', userId],
    queryFn: async () =>
      sendRequest(
        {
          method: 'get',
          url: `/users/${userId}`,
        },
        { schema: UserResponseSchema },
      ),
  });
}
