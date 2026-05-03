import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from '@tanstack/react-router';
import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';

import { isDev } from '@/lib/env';
import { setupI18n } from '@/plugins/i18n';
import queryClient from '@/plugins/query';
import { createTanstackRouterWithQueryClient } from '@/plugins/router';

import '@/index.css';

const router = createTanstackRouterWithQueryClient(queryClient);

// Register things for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

const rootElement = document.getElementById('app')!;

if (!rootElement.innerHTML) {
  setupI18n()
    .then(() => {
      const root = ReactDOM.createRoot(rootElement);

      root.render(
        <StrictMode>
          <QueryClientProvider client={queryClient}>
            <RouterProvider router={router} />
          </QueryClientProvider>
        </StrictMode>,
      );
    })
    .catch((err) => {
      if (isDev) {
        console.error('i18n setup failed', err);
      }
    });
}
