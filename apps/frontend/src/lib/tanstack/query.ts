import type { QueryKey } from '@tanstack/react-query';

import { matchQuery, MutationCache, QueryCache, QueryClient } from '@tanstack/react-query';

import { HttpError } from '@/lib/axios/http-error';

declare module '@tanstack/react-query' {
  // eslint-disable-next-line ts/consistent-type-definitions
  interface Register {
    queryMeta: {
      skipGlobalError?: boolean;
    };
    mutationMeta: {
      invalidates?: QueryKey[];
      skipGlobalError?: boolean;
    };
  }
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // 401/403/404 重試三次只會造成使用者無謂等待，直接放棄重試
        if (error instanceof HttpError && error.httpStatus >= 400 && error.httpStatus < 500) {
          return false;
        }

        return failureCount < 3;
      },
      retryDelay: 1_000, // 1 秒
      staleTime: 1_000 * 30, // 30 秒
      refetchOnWindowFocus: false,
      throwOnError: true,
    },
    mutations: {
      retry: 0, // mutation 預設不 retry，避免重複 side effect
    },
  },
  queryCache: new QueryCache({
    onError: (error, query) => {
      // 如果 query 標記了 skipGlobalError，就跳過
      if (query.meta?.skipGlobalError) return;

      console.error(error);
    },
  }),
  mutationCache: new MutationCache({
    // eslint-disable-next-line max-params
    onError: (error, _vars, _ctx, mutation) => {
      // 標記 skipGlobalError 的 mutation 自行於元件層處理錯誤，跳過全域顯示
      if (mutation.meta?.skipGlobalError) return;

      console.error(error);
    },
    // eslint-disable-next-line max-params
    onSuccess: (_data, _vars, _ctx, mutation) => {
      // 未宣告 meta.invalidates 的 mutation 不做任何 invalidation（opt-in）
      // 全域 callback 採 fire-and-forget，不 await；若特定 mutation 需要等 refetch
      // 完成再繼續，請在該 useMutation 的 local onSuccess return invalidateQueries(...)
      queryClient.invalidateQueries({
        predicate: (query) =>
          mutation.meta?.invalidates?.some((queryKey) => matchQuery({ queryKey }, query)) ?? false,
      });
    },
  }),
});

export default queryClient;
