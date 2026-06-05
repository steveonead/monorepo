import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_auth/campaigns/')({
  component: RouteComponent,
  errorComponent: () => (
    <div className="text-destructive p-4 text-sm">載入 campaign 列表失敗，請稍後再試。</div>
  ),
});

function RouteComponent() {
  return <>Campaign</>;
}
