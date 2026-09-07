import { AlertCircle, CheckCircle2, Send } from 'lucide-react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import Footer from '../components/layout/Footer';
import Navbar from '../components/layout/Navbar';
import SectionEyebrow from '../components/ui/SectionEyebrow';
import { submitContactInquiry, type ContactInquiryInput } from '../services/contactService';

type FormErrors = Partial<Record<keyof ContactInquiryInput, string>>;

const initialForm: ContactInquiryInput = {
  name: '',
  email: '',
  subject: '',
  message: '',
};

function validateForm(form: ContactInquiryInput): FormErrors {
  const errors: FormErrors = {};

  if (!form.name.trim()) errors.name = 'Please enter your name.';
  if (!form.email.trim()) {
    errors.email = 'Please enter your email.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    errors.email = 'Please enter a valid email address.';
  }
  if (!form.subject.trim()) errors.subject = 'Please enter a subject.';
  if (!form.message.trim()) errors.message = 'Please enter a message.';

  return errors;
}

export default function ContactPage() {
  const [form, setForm] = useState<ContactInquiryInput>(initialForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<'success' | 'error' | null>(null);

  function updateField(field: keyof ContactInquiryInput, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setFeedback(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validationErrors = validateForm(form);
    setErrors(validationErrors);
    setFeedback(null);

    if (Object.keys(validationErrors).length > 0) return;

    setIsSubmitting(true);

    try {
      await submitContactInquiry({
        name: form.name.trim(),
        email: form.email.trim(),
        subject: form.subject.trim(),
        message: form.message.trim(),
      });
      setForm(initialForm);
      setFeedback('success');
    } catch {
      setFeedback('error');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="bg-background text-foreground">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="text-center">
            <SectionEyebrow text="Contact Zyvero" />
            <h1 className="mt-5 text-4xl font-semibold tracking-[-0.05em] text-white sm:text-5xl">
              Let&apos;s talk about what you&apos;re building.
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-muted sm:text-lg">
              Send us a message and our team will get back to you as soon as possible.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            noValidate
            className="mt-10 rounded-[28px] border border-border bg-surface p-5 shadow-[0_24px_80px_rgba(3,7,18,0.45)] sm:p-8"
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <Field
                id="name"
                label="Name"
                value={form.name}
                error={errors.name}
                onChange={(value) => updateField('name', value)}
                disabled={isSubmitting}
              />
              <Field
                id="email"
                label="Email"
                type="email"
                value={form.email}
                error={errors.email}
                onChange={(value) => updateField('email', value)}
                disabled={isSubmitting}
              />
            </div>

            <div className="mt-5">
              <Field
                id="subject"
                label="Subject"
                value={form.subject}
                error={errors.subject}
                onChange={(value) => updateField('subject', value)}
                disabled={isSubmitting}
              />
            </div>

            <div className="mt-5">
              <label htmlFor="message" className="mb-2 block text-sm font-medium text-foreground">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                rows={6}
                value={form.message}
                disabled={isSubmitting}
                onChange={(event) => updateField('message', event.target.value)}
                className={`w-full resize-y rounded-xl border bg-surface-secondary px-4 py-3 text-sm text-foreground outline-none transition placeholder:text-muted/70 focus:ring-2 focus:ring-primary/40 ${
                  errors.message ? 'border-error' : 'border-border focus:border-primary'
                }`}
                placeholder="Tell us how we can help."
                aria-invalid={Boolean(errors.message)}
                aria-describedby={errors.message ? 'message-error' : undefined}
              />
              {errors.message ? <FieldError id="message-error" message={errors.message} /> : null}
            </div>

            {feedback === 'success' ? (
              <div
                role="status"
                className="mt-6 flex items-start gap-3 rounded-xl border border-success/40 bg-success/10 p-4 text-sm text-success"
              >
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
                <span>Your message was sent successfully. We&apos;ll be in touch soon.</span>
              </div>
            ) : null}

            {feedback === 'error' ? (
              <div
                role="alert"
                className="mt-6 flex items-start gap-3 rounded-xl border border-error/40 bg-error/10 p-4 text-sm text-error"
              >
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                <span>We couldn&apos;t send your message. Please try again.</span>
              </div>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Send className="h-4 w-4" />
              {isSubmitting ? 'Sending...' : 'Send message'}
            </button>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}

type FieldProps = {
  id: keyof ContactInquiryInput;
  label: string;
  type?: string;
  value: string;
  error?: string;
  disabled: boolean;
  onChange: (value: string) => void;
};

function Field({ id, label, type = 'text', value, error, disabled, onChange }: FieldProps) {
  const errorId = `${id}-error`;

  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-medium text-foreground">
        {label}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className={`w-full rounded-xl border bg-surface-secondary px-4 py-3 text-sm text-foreground outline-none transition placeholder:text-muted/70 focus:ring-2 focus:ring-primary/40 ${
          error ? 'border-error' : 'border-border focus:border-primary'
        }`}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        placeholder={`Your ${label.toLowerCase()}`}
      />
      {error ? <FieldError id={errorId} message={error} /> : null}
    </div>
  );
}

function FieldError({ id, message }: { id: string; message: string }) {
  return (
    <p id={id} className="mt-2 text-xs text-error">
      {message}
    </p>
  );
}
