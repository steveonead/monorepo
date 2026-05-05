import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from '@tanstack/react-router';
import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';

import { isDev } from '@/lib/env';
import { setupI18n } from '@/lib/i18n';
import queryClient from '@/lib/tanstack/query';
import router from '@/lib/tanstack/router';

import '@/index.css';

// eslint-disable-next-line ts/no-non-null-assertion
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
