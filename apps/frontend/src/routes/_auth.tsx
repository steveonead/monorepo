import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';

import { userQueryOption } from '@/features/auth/queries/user';

export const Route = createFileRoute('/_auth')({
  beforeLoad: async ({ context: { queryClient } }) => {
    const user = await queryClient.ensureQueryData(userQueryOption(1));

    if (user.status !== 'success') {
      throw redirect({ to: '/login' });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  return <Outlet />;
}
