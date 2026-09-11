import type { ReactNode, FormEvent } from 'react';
import { Link } from 'react-router-dom';

export function AuthForm({
  title,
  subtitle,
  submitLabel,
  error,
  onSubmit,
  fields,
  footer,
}: {
  title: string;
  subtitle: string;
  submitLabel: string;
  error: string;
  onSubmit: (e: FormEvent) => void;
  fields: ReactNode;
  footer: ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-10 flex justify-center text-sm font-semibold tracking-[0.2em]">
          ZYVERO
        </Link>
        <div className="rounded-3xl border border-border bg-surface p-6 shadow-2xl shadow-black/20 sm:p-8">
          <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-2 text-sm text-muted">{subtitle}</p>
          <form onSubmit={onSubmit} className="mt-8 space-y-5">
            {fields}
            {error && (
              <p
                role="alert"
                className="rounded-xl border border-error/30 bg-error/10 p-3 text-sm text-error"
              >
                {error}
              </p>
            )}
            <button
              disabled={submitLabel.includes('...')}
              className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary-hover disabled:opacity-60"
            >
              {submitLabel}
            </button>
          </form>
          <div className="mt-6 text-center text-sm text-muted">{footer}</div>
        </div>
      </div>
    </div>
  );
}

export function AuthInput({
  label,
  type = 'text',
  value,
  onChange,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-2 block font-medium text-foreground">{label}</span>
      <input
        required
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-border bg-surface-secondary px-4 py-3 text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
      />
    </label>
  );
}
