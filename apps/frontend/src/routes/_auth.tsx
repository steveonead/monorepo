import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';

import { getToken } from '@/features/auth/stores/auth-store';

export const Route = createFileRoute('/_auth')({
  beforeLoad: () => {
    if (!getToken()) {
      throw redirect({ to: '/login' });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  return <Outlet />;
}
