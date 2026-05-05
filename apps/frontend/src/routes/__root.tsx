import type { QueryClient } from '@tanstack/react-query';

import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { createRootRouteWithContext, Link, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';

import Footer from '@/components/layout/footer';
import Header from '@/components/layout/header';
import { isDev } from '@/lib/env';

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
}>()({
  component: RootComponent,
  notFoundComponent: () => {
    return (
      <WithDevTools>
        <div>
          <p>This is the notFoundComponent configured on root route</p>
          <Link to="/">Start Over</Link>
        </div>
      </WithDevTools>
    );
  },
  errorComponent: ({ error }) => {
    return (
      <WithDevTools>
        <div>
          <p>This is the errorComponent configured on root route</p>
          <pre>{error.message}</pre>
          <Link to="/">Start Over</Link>
        </div>
      </WithDevTools>
    );
  },
});

function WithDevTools({ children }: { children: React.ReactNode }) {
  if (!isDev) {
    return <>{children}</>;
  }

  return (
    <>
      {children}
      <ReactQueryDevtools buttonPosition="bottom-right" />
      <TanStackRouterDevtools position="bottom-left" />
    </>
  );
}

function RootComponent() {
  return (
    <WithDevTools>
      <div className="flex min-h-screen flex-col">
        <Header />
        <hr />
        <Outlet />
        <Footer />
      </div>
    </WithDevTools>
  );
}
