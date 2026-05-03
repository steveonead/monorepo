import type { QueryClient } from '@tanstack/react-query';

import { createRouter } from '@tanstack/react-router';

import { routeTree } from '@/routeTree.gen';

export function createTanstackRouterWithQueryClient(queryClient: QueryClient) {
  return createRouter({
    routeTree,
    context: {
      queryClient,
    },
    defaultPreload: 'intent',
    defaultPreloadStaleTime: 0,
    scrollRestoration: true,
    // 超過 500ms 才顯示 pending UI
    defaultPendingMs: 500,
    // 顯示後至少維持 800ms，避免閃爍
    defaultPendingMinMs: 800,
  });
}
