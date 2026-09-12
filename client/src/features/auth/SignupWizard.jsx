import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router';
import { Check, Upload, X } from 'lucide-react';
import { signupStep1Schema, signupStep2Schema, WORK_AUTH } from '@candidate-portal/shared/schemas/auth';

import { Button, Field, Select } from '../../components/primitives/index.js';
import { apiError } from '../../lib/api.js';
import { cn } from '../../lib/cn.js';
import { AuthError, AuthHeading, AuthPanel } from './AuthPanel.jsx';
import { useSignup } from './queries.js';

const STEPS = ['Account', 'Profile', 'Resume'];

// Three steps, one POST at the end.
export const SignupWizard = () => {
  const [step, setStep] = useState(1);
  const [values, setValues] = useState({});
  const [resume, setResume] = useState(null);
  const navigate = useNavigate();
  const signup = useSignup();

  const finish = (last) => {
    const payload = { ...values, ...last };
    signup.mutate(payload, {
      // The new user's name must immediately drive the chrome — useSignup seeds
      // the `me` cache, so the greeting and both avatars are right on arrival.
      onSuccess: () => navigate('/', { replace: true })
    });
  };

  return (
    <AuthPanel>
      <StepBar step={step} />

      {step === 1 && (
        <StepAccount
          defaults={values}
          onNext={(v) => { setValues((p) => ({ ...p, ...v })); setStep(2); }}
        />
      )}
      {step === 2 && (
        <StepProfile
          defaults={values}
          onBack={(v) => { setValues((p) => ({ ...p, ...v })); setStep(1); }}
          onNext={(v) => { setValues((p) => ({ ...p, ...v })); setStep(3); }}
        />
      )}
      {step === 3 && (
        <StepResume
          resume={resume}
          setResume={setResume}
          error={signup.isError && apiError(signup.error)?.message}
          pending={signup.isPending}
          onBack={() => setStep(2)}
          onFinish={() => finish({})}
        />
      )}

      <p className="mt-6 text-body-sm text-ink-secondary">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-accent hover:text-accent-hover">Sign in</Link>
      </p>
    </AuthPanel>
  );
};

const StepBar = ({ step }) => (
  <ol className="mb-7 grid grid-cols-3 gap-2">
    {STEPS.map((label, i) => {
      const n = i + 1;
      const reached = n <= step;
      return (
        <li key={label}>
          <span
            aria-hidden="true"
            className={cn('block h-1 rounded-full', reached ? 'bg-accent' : 'bg-neutral-knob')}
          />
          <span
            className={cn(
              'mt-2 block text-[11.5px] leading-none',
              reached ? 'text-ink' : 'text-ink-faint',
              n === step ? 'font-semibold' : 'font-normal'
            )}
          >
            {label}
          </span>
        </li>
      );
    })}
  </ol>
);

const Footer = ({ onBack, backLabel, submitLabel, pending }) => (
  <div className="mt-6 flex gap-2.5">
    <Button variant="secondary" size="xl" className="flex-1" onClick={onBack}>
      {backLabel}
    </Button>
    <Button type="submit" variant="primary" size="xl" className="flex-[2]" loading={pending}>
      {submitLabel}
    </Button>
  </div>
);

const StepAccount = ({ defaults, onNext }) => {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(signupStep1Schema),
    defaultValues: { firstName: '', lastName: '', email: '', password: '', consent: false, ...defaults }
  });

  return (
    <form onSubmit={handleSubmit(onNext)} noValidate>
      <AuthHeading
        title="Create your account"
        sub="One account covers every role you apply to at Rivian & VW Tech."
      />

      <div className="space-y-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-[1_1_130px]">
            <Field label="First name" error={errors.firstName?.message} {...register('firstName')} />
          </div>
          <div className="flex-[1_1_130px]">
            <Field label="Last name" error={errors.lastName?.message} {...register('lastName')} />
          </div>
        </div>
        <Field type="email" label="Email" autoComplete="email" error={errors.email?.message} {...register('email')} />
        <Field
          type="password"
          label="Password"
          placeholder="At least 8 characters"
          autoComplete="new-password"
          error={errors.password?.message}
          {...register('password')}
        />
      </div>

      <label className="mt-5 flex cursor-pointer items-start gap-2.5">
        <input type="checkbox" className="mt-0.5 h-4 w-4 shrink-0 accent-accent" {...register('consent')} />
        <span className="text-[12.5px] leading-[1.55] text-ink-secondary">
          I agree to the candidate privacy notice and to being contacted about my applications.
        </span>
      </label>
      <AuthError>{errors.consent?.message}</AuthError>

      <Footer onBack={() => navigate('/login')} backLabel="Cancel" submitLabel="Continue" />
    </form>
  );
};

const StepProfile = ({ defaults, onBack, onNext }) => {
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(signupStep2Schema),
    defaultValues: { city: '', phone: '', workAuth: undefined, targetRole: '', ...defaults }
  });

  return (
    <form onSubmit={handleSubmit(onNext)} noValidate>
      <AuthHeading
        title="A few basics"
        sub="These carry over to every application, so you only enter them once."
      />

      <div className="space-y-4">
        <Field label="Location" error={errors.city?.message} {...register('city')} />
        <Field label="Phone" autoComplete="tel" error={errors.phone?.message} {...register('phone')} />
        <Select
          label="Work authorization"
          placeholder="Select…"
          value={watch('workAuth')}
          onValueChange={(v) => setValue('workAuth', v, { shouldValidate: true })}
          options={WORK_AUTH}
          error={errors.workAuth?.message}
        />
        <Field label="What kind of role are you after?" error={errors.targetRole?.message} {...register('targetRole')} />
      </div>

      <Footer onBack={() => onBack(watch())} backLabel="Back" submitLabel="Continue" />
    </form>
  );
};

const StepResume = ({ resume, setResume, onBack, onFinish, pending, error }) => (
  <form onSubmit={(e) => { e.preventDefault(); onFinish(); }} noValidate>
    <AuthHeading title="Add your resume" sub="Optional now, required before you submit an application." />

    {resume ? (
      <div className="flex items-center gap-3 rounded-card bg-success-bgAlt p-4">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-success-bg text-success">
          <Check aria-hidden="true" size={16} strokeWidth={2} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-label-lg font-medium text-ink">{resume.name}</span>
          <span className="mt-1 block text-meta text-ink-muted">{formatSize(resume.size)}</span>
        </span>
        <Button variant="ghost" size="sm" onClick={() => setResume(null)}>
          <X aria-hidden="true" size={14} strokeWidth={1.6} />Remove
        </Button>
      </div>
    ) : (
      <Dropzone onFile={setResume} />
    )}

    <AuthError>{error}</AuthError>
    <Footer onBack={onBack} backLabel="Back" submitLabel="Finish and enter portal" pending={pending} />
  </form>
);

const Dropzone = ({ onFile }) => (
  <label
    className={cn(
      'flex cursor-pointer flex-col items-center rounded-card border border-dashed border-line-controlHover bg-surface-sunken px-4 py-[34px] text-center',
      'transition-[background-color,border-color] duration-control hover:border-accent hover:bg-accent-wash'
    )}
  >
    <input
      type="file"
      accept=".pdf,.doc,.docx"
      className="sr-only"
      onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])}
    />
    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-tint text-accent">
      <Upload aria-hidden="true" size={18} strokeWidth={1.6} />
    </span>
    <span className="mt-3 text-[13.5px] font-medium text-ink">Choose a file</span>
    <span className="mt-1 text-meta-lg text-ink-muted">PDF or DOCX · up to 10 MB</span>
  </label>
);

const formatSize = (bytes) =>
  bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.round(bytes / 1024)} KB`;
