import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/_layout')({
  component: Layout,
});

function Layout() {
  return (
    <div className="flex h-screen flex-col bg-green-50 p-2">
      <div className="border-b">I'm a layout</div>
      <div className="flex-1">
        <Outlet />
      </div>
    </div>
  );
}
