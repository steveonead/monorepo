import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_auth/campaign/')({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/_auth/campaign/$c-id"!</div>;
}
