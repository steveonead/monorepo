import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_layout/layout-a')({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>_layout inner TEXT</div>;
}
