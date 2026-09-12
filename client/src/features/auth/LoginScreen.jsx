import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useSearchParams, Link } from 'react-router';
import { useState } from 'react';
import { Check } from 'lucide-react';
import { loginSchema, forgotPasswordSchema } from '@candidate-portal/shared/schemas/auth';

import { Button, Field } from '../../components/primitives/index.js';
import { apiError } from '../../lib/api.js';
import { AuthError, AuthHeading, AuthPanel } from './AuthPanel.jsx';
import { SocialAuth } from './SocialAuth.jsx';
import { useForgotPassword, useLogin, useSso } from './queries.js';

export const LoginScreen = () => {
  const [params, setParams] = useSearchParams();
  const view = params.get('view');

  return (
    <AuthPanel>
      {view === 'forgot' ? (
        <ForgotView onSent={(email) => setParams({ view: 'sent', email })} />
      ) : view === 'sent' ? (
        <SentView email={params.get('email')} />
      ) : (
        <SignInView />
      )}
    </AuthPanel>
  );
};

const SignInView = () => {
  const navigate = useNavigate();
  const login = useLogin();
  const sso = useSso();
  const [show, setShow] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '', remember: false }
  });

  // The session may have died on a specific page; land back there after signing
  // in. Read the stashed path BEFORE clearing it.
  const enter = () => {
    const to = sessionStorage.getItem('cp:lastLocation') || '/';
    sessionStorage.removeItem('cp:lastLocation');
    navigate(to, { replace: true });
  };

  return (
    <>
      <AuthHeading title="Welcome back" sub="Access your candidate portal." />

      <form onSubmit={handleSubmit((v) => login.mutate(v, { onSuccess: enter }))} noValidate>
        <div className="space-y-4">
          <Field
            size="lg"
            type="email"
            label="Email"
            autoComplete="email"
            error={errors.email?.message}
            {...register('email')}
          />
          <Field
            size="lg"
            label="Password"
            type={show ? 'text' : 'password'}
            autoComplete="current-password"
            error={errors.password?.message}
            labelAction={
              <button
                type="button"
                onClick={() => setShow((v) => !v)}
                className="text-label font-medium text-accent hover:text-accent-hover"
              >
                {show ? 'Hide' : 'Show'}
              </button>
            }
            {...register('password')}
          />
        </div>

        <div className="my-5 flex items-center justify-between gap-3">
          <label className="flex cursor-pointer items-center gap-2 text-body-sm text-ink-secondary">
            <input type="checkbox" className="h-4 w-4 accent-accent" {...register('remember')} />
            Remember me
          </label>
          <Link to="?view=forgot" className="text-label-lg font-medium text-accent hover:text-accent-hover">
            Forgot password?
          </Link>
        </div>

        <AuthError>{login.isError && apiError(login.error)?.message}</AuthError>

        <Button type="submit" variant="primary" size="xl" fullWidth loading={login.isPending}>
          Sign in
        </Button>
      </form>

      <SocialAuth pending={sso.isPending} onSelect={(p) => sso.mutate(p, { onSuccess: enter })} />

      <p className="mt-6 text-body-sm text-ink-secondary">
        New here?{' '}
        <Link to="/signup" className="font-medium text-accent hover:text-accent-hover">
          Create an account
        </Link>
      </p>
    </>
  );
};

const ForgotView = ({ onSent }) => {
  const forgot = useForgotPassword();
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' }
  });

  return (
    <>
      <AuthHeading title="Reset your password" sub="We'll email you a link to choose a new one." />
      <form onSubmit={handleSubmit((v) => forgot.mutate(v, { onSuccess: () => onSent(v.email) }))} noValidate>
        <Field size="lg" type="email" label="Email" autoComplete="email" error={errors.email?.message} {...register('email')} />
        <Button type="submit" variant="primary" size="xl" fullWidth loading={forgot.isPending} className="mt-5">
          Send reset link
        </Button>
      </form>
      <BackToSignIn />
    </>
  );
};

const BackToSignIn = () => (
  <Link to="/login" className="mt-2.5 block">
    <Button variant="ghost" size="lg" fullWidth tabIndex={-1}>
      Back to sign in
    </Button>
  </Link>
);

const SentView = ({ email }) => (
  <>
    <span className="mb-5 flex h-[42px] w-[42px] items-center justify-center rounded-full bg-success-bg text-success">
      <Check aria-hidden="true" size={20} strokeWidth={2} />
    </span>
    <AuthHeading
      title="Check your inbox"
      sub={`If an account uses ${email ?? 'that address'}, a reset link is on its way.`}
    />
    <Link to="/login" className="block">
      <Button variant="primary" size="xl" fullWidth tabIndex={-1}>
        Back to sign in
      </Button>
    </Link>
  </>
);
