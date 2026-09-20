import { Edit3, Plus, Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import AppShell from '../components/app/AppShell';
import { apiRequest } from '../services/api';

type Service = {
  id: string;
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  icon: string;
  sortOrder: number;
  isActive: boolean;
};
type Form = Omit<Service, 'id'>;
const empty: Form = {
  name: '',
  slug: '',
  shortDescription: '',
  description: '',
  icon: 'Sparkles',
  sortOrder: 0,
  isActive: true,
};

export default function AdminServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [form, setForm] = useState<Form>(empty);
  const [editing, setEditing] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const load = () =>
    apiRequest<Service[]>('/admin/services')
      .then(setServices)
      .catch(() => setError('Unable to load services.'));
  useEffect(() => {
    void load();
  }, []);
  const update = (key: keyof Form, value: string | number | boolean) =>
    setForm((current) => ({ ...current, [key]: value }));
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    setMessage('');
    try {
      await apiRequest<Service>(editing ? `/admin/services/${editing}` : '/admin/services', {
        method: editing ? 'PATCH' : 'POST',
        body: form,
      });
      setForm(empty);
      setEditing(null);
      setMessage(editing ? 'Service updated.' : 'Service created.');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save service.');
    } finally {
      setBusy(false);
    }
  };
  const edit = (service: Service) => {
    setEditing(service.id);
    setForm({
      name: service.name,
      slug: service.slug,
      shortDescription: service.shortDescription,
      description: service.description,
      icon: service.icon,
      sortOrder: service.sortOrder,
      isActive: service.isActive,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const remove = async (service: Service) => {
    if (!window.confirm(`Delete ${service.name}?`)) return;
    try {
      await apiRequest<void>(`/admin/services/${service.id}`, { method: 'DELETE' });
      setMessage('Service deleted.');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to delete service.');
    }
  };
  return (
    <AppShell>
      <div className="space-y-8">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-primary">Administration</p>
          <h1 className="mt-3 text-3xl font-semibold text-white">Services</h1>
          <p className="mt-2 text-muted">Control the public services catalog from one place.</p>
        </div>
        {(message || error) && (
          <p
            className={`rounded-xl border p-4 text-sm ${error ? 'border-error/40 bg-error/10 text-error' : 'border-success/40 bg-success/10 text-success'}`}
          >
            {error || message}
          </p>
        )}
        <form
          onSubmit={submit}
          className="grid gap-4 rounded-2xl border border-border bg-surface p-5 md:grid-cols-2"
        >
          <div className="flex items-center justify-between md:col-span-2">
            <h2 className="text-lg font-semibold text-white">
              {editing ? 'Edit service' : 'Add service'}
            </h2>
            {editing && (
              <button
                type="button"
                onClick={() => {
                  setEditing(null);
                  setForm(empty);
                }}
                className="text-muted hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
          <Input label="Name" value={form.name} onChange={(value) => update('name', value)} />
          <Input label="Slug" value={form.slug} onChange={(value) => update('slug', value)} />
          <Input
            label="Short description"
            value={form.shortDescription}
            onChange={(value) => update('shortDescription', value)}
          />
          <Input label="Icon name" value={form.icon} onChange={(value) => update('icon', value)} />
          <label className="text-sm text-muted">
            Description
            <textarea
              required
              minLength={1}
              value={form.description}
              onChange={(event) => update('description', event.target.value)}
              className="mt-2 min-h-28 w-full rounded-xl border border-border bg-surface-secondary p-3 text-sm text-foreground outline-none focus:border-primary"
            />
          </label>
          <div className="space-y-4">
            <label className="block text-sm text-muted">
              Sort order
              <input
                type="number"
                min="0"
                value={form.sortOrder}
                onChange={(event) => update('sortOrder', Number(event.target.value))}
                className="mt-2 w-full rounded-xl border border-border bg-surface-secondary p-3 text-sm text-foreground outline-none focus:border-primary"
              />
            </label>
            <label className="flex items-center gap-2 text-sm text-muted">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(event) => update('isActive', event.target.checked)}
              />{' '}
              Visible on public website
            </label>
          </div>
          <button
            disabled={busy}
            className="inline-flex w-fit items-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
          >
            <Plus className="h-4 w-4" />
            {busy ? 'Saving...' : editing ? 'Save changes' : 'Create service'}
          </button>
        </form>
        <div className="overflow-hidden rounded-2xl border border-border bg-surface">
          <div className="border-b border-border p-5">
            <h2 className="font-semibold text-white">Service catalog</h2>
          </div>
          {services.length === 0 ? (
            <p className="p-5 text-sm text-muted">No services yet.</p>
          ) : (
            <div className="divide-y divide-border">
              {services.map((service) => (
                <div
                  key={service.id}
                  className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="font-medium text-white">{service.name}</h3>
                      <span
                        className={`rounded-full px-2 py-1 text-xs ${service.isActive ? 'bg-success/10 text-success' : 'bg-surface-secondary text-muted'}`}
                      >
                        {service.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-muted">{service.shortDescription}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => edit(service)}
                      className="rounded-lg border border-border p-2 text-muted hover:text-white"
                      aria-label={`Edit ${service.name}`}
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => void remove(service)}
                      className="rounded-lg border border-border p-2 text-muted hover:text-error"
                      aria-label={`Delete ${service.name}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}

function Input({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="text-sm text-muted">
      {label}
      <input
        required
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-xl border border-border bg-surface-secondary p-3 text-sm text-foreground outline-none focus:border-primary"
      />
    </label>
  );
}
