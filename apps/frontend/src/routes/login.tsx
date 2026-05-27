import { createFileRoute } from '@tanstack/react-router';

import { LoginForm } from '@/features/auth/components/login-form';

export const Route = createFileRoute('/login')({
  component: LoginPage,
});

function LoginPage() {
  return (
    <div className="bg-muted fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="bg-card w-full max-w-md overflow-hidden rounded-lg border shadow-lg">
        {/* Accent bar */}
        <div className="bg-primary h-1" />

        <div className="p-10">
          {/* Logo row */}
          <div className="mb-9 flex items-center gap-3">
            <div className="bg-primary flex size-10 shrink-0 items-center justify-center rounded-md">
              <span className="text-primary-foreground text-lg leading-none font-bold">S</span>
            </div>
            <div>
              <div className="text-foreground text-sm font-bold tracking-wide">SUPERDSP</div>
              <div className="text-muted-foreground mt-0.5 text-xs tracking-widest uppercase">
                Demand-Side Platform
              </div>
            </div>
          </div>

          {/* Heading */}
          <div className="mb-7">
            <h1 className="text-foreground text-xl font-semibold tracking-tight">Sign In</h1>
            <p className="text-muted-foreground mt-1.5 text-sm/relaxed">
              Access your programmatic advertising console
            </p>
          </div>

          <LoginForm />
        </div>

        {/* Footer */}
        <div className="bg-muted border-t px-10 py-3.5">
          <p className="text-muted-foreground text-center text-xs tracking-widest uppercase">
            Powered by SuperDSP v2.0
          </p>
        </div>
      </div>
    </div>
  );
}
