import { createRouter } from '@tanstack/react-router';

import queryClient from '@/lib/tanstack/query';
import { routeTree } from '@/routeTree.gen';

declare module '@tanstack/react-router' {
  // eslint-disable-next-line ts/consistent-type-definitions
  interface Register {
    router: typeof router;
  }
}

const router = createRouter({
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

export default router;
