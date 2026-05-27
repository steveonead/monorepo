import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_auth/campaigns/')({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/_auth/campaigns/"!</div>;
}
