import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  // 首頁不再是 demo 頁，導向 app 入口；未登入會由 /_auth 守衛再轉去 /login
  beforeLoad: () => {
    throw redirect({ to: '/campaigns' });
  },
});
