import { LoginSchema } from '@superdsp/api-schemas/auth/login';
import { useForm } from '@tanstack/react-form';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { loginMutationOptions } from '@/features/auth/mutations/login';
import { useAuthStoreActions } from '@/features/auth/stores/auth-store';

export function LoginForm() {
  'use memo';
  const { setToken } = useAuthStoreActions();
  const navigate = useNavigate();

  const mutation = useMutation({
    ...loginMutationOptions(),
    onSuccess: ({ token }) => {
      setToken(token);
      void navigate({ to: '/campaigns' });
    },
  });

  const form = useForm({
    defaultValues: { email: '', password: '' },
    onSubmit: ({ value }) => {
      mutation.mutate(value);
    },
  });

  return (
    <form
      noValidate
      className="flex flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        void form.handleSubmit();
      }}
    >
      {mutation.isError ? (
        <p
          role="alert"
          className="bg-destructive/10 text-destructive rounded-md px-3 py-2 text-sm"
        >
          帳號或密碼錯誤
        </p>
      ) : null}

      <form.Field
        name="email"
        validators={{ onSubmit: LoginSchema.shape.email }}
      >
        {(field) => {
          const hasError = field.state.meta.errors.length > 0;
          return (
            <div>
              <label
                htmlFor={field.name}
                className="text-muted-foreground mb-1.5 block text-xs tracking-wider uppercase"
              >
                Email Address
              </label>
              <Input
                id={field.name}
                name={field.name}
                type="email"
                autoComplete="email"
                placeholder="輸入 admin@superdsp.com"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                aria-invalid={hasError}
                aria-describedby={hasError ? `${field.name}-error` : undefined}
              />
              {hasError ? (
                <p
                  id={`${field.name}-error`}
                  className="text-destructive mt-1.5 text-xs"
                >
                  {field.state.meta.errors.map((err) => err?.message).join(', ')}
                </p>
              ) : null}
            </div>
          );
        }}
      </form.Field>

      <form.Field
        name="password"
        validators={{ onSubmit: LoginSchema.shape.password }}
      >
        {(field) => {
          const hasError = field.state.meta.errors.length > 0;
          return (
            <div>
              <label
                htmlFor={field.name}
                className="text-muted-foreground mb-1.5 block text-xs tracking-wider uppercase"
              >
                Password
              </label>
              <Input
                id={field.name}
                name={field.name}
                type="password"
                autoComplete="current-password"
                placeholder="輸入 Gsp123456"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                aria-invalid={hasError}
                aria-describedby={hasError ? `${field.name}-error` : undefined}
              />
              {hasError ? (
                <p
                  id={`${field.name}-error`}
                  className="text-destructive mt-1.5 text-xs"
                >
                  {field.state.meta.errors.map((err) => err?.message).join(', ')}
                </p>
              ) : null}
            </div>
          );
        }}
      </form.Field>

      <div className="flex justify-end">
        <a
          href="#noop"
          className="text-primary text-xs tracking-wide uppercase no-underline"
        >
          Forgot Password
        </a>
      </div>

      <Button
        type="submit"
        className="h-11 w-full text-xs tracking-wider uppercase"
      >
        Sign In →
      </Button>

      <div className="flex items-center gap-3">
        <div className="bg-border h-px flex-1" />
        <span className="text-muted-foreground text-xs tracking-wider uppercase">or</span>
        <div className="bg-border h-px flex-1" />
      </div>

      {/* SSO：後端尚未就緒，先 disabled（handoff 視覺規格） */}
      <Button
        type="button"
        variant="outline"
        disabled
        className="h-11 w-full text-xs tracking-widest uppercase"
      >
        Single Sign-On (SSO)
      </Button>
    </form>
  );
}
