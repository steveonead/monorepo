import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from '@tanstack/react-router';
import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';

import { setupI18n } from '@/lib/i18n';
import queryClient from '@/lib/tanstack/query';
import router from '@/lib/tanstack/router';

import '@/index.css';

// eslint-disable-next-line ts/no-non-null-assertion
const rootElement = document.getElementById('app')!;

function renderApp() {
  const root = ReactDOM.createRoot(rootElement);

  root.render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </StrictMode>,
  );
}

if (!rootElement.innerHTML) {
  setupI18n()
    .then(renderApp)
    .catch((err) => {
      // i18n 初始化失敗時仍以 fallbackLng 渲染，避免整頁空白；prod 也需可觀測
      console.error('i18n setup failed', err);
      renderApp();
    });
}
