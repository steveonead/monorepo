import type { LoginInput } from '@superdsp/api-schemas/auth/login';

import { LoginResponseSchema } from '@superdsp/api-schemas/auth/login';
import { mutationOptions } from '@tanstack/react-query';

import { sendRequest } from '@/lib/axios';

export function loginMutationOptions() {
  return mutationOptions({
    mutationFn: (input: LoginInput) => {
      return sendRequest(
        { method: 'POST', url: 'auth/login', data: input },
        { schema: LoginResponseSchema },
      );
    },
  });
}
