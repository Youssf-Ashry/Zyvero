import { Link } from 'react-router-dom';
import { useEffect, useState, type FormEvent } from 'react';
import AppShell from '../components/app/AppShell';
import { apiRequest } from '../services/api';

type Service = { id: string; name: string; shortDescription: string };
type RequestItem = {
  id: string;
  title: string;
  description: string;
  status: RequestStatus;
  createdAt: string;
  updatedAt: string;
  service: { id: string; name: string };
};
type RequestStatus = 'NEW' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

const statusLabels: Record<RequestStatus, string> = {
  NEW: 'New',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

export default function RequestsPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [serviceId, setServiceId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const [availableServices, ownRequests] = await Promise.all([
        apiRequest<Service[]>('/services'),
        apiRequest<RequestItem[]>('/requests'),
      ]);
      setServices(availableServices);
      setRequests(ownRequests);
      if (!serviceId && availableServices[0]) setServiceId(availableServices[0].id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    setMessage('');
    try {
      await apiRequest<RequestItem>('/requests', {
        method: 'POST',
        body: { serviceId, title, description },
      });
      setTitle('');
      setDescription('');
      setMessage('Your service request was submitted.');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to submit request.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppShell>
      <div className="space-y-8">
        <header>
          <p className="text-xs uppercase tracking-[0.2em] text-primary">Customer support</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-white">My Requests</h1>
          <p className="mt-2 text-muted">Submit a request and track its progress with Zyvero.</p>
        </header>
        {(error || message) && (
          <p
            className={`rounded-xl border p-4 text-sm ${error ? 'border-error/40 bg-error/10 text-error' : 'border-success/40 bg-success/10 text-success'}`}
          >
            {error || message}
          </p>
        )}
        <form
          onSubmit={submit}
          className="grid gap-4 rounded-2xl border border-border bg-surface p-5"
        >
          <h2 className="text-lg font-semibold text-white">Request a Service</h2>
          <label className="text-sm text-muted">
            Service
            <select
              required
              value={serviceId}
              onChange={(event) => setServiceId(event.target.value)}
              className="mt-2 w-full rounded-xl border border-border bg-surface-secondary p-3 text-foreground outline-none focus:border-primary"
            >
              <option value="">Select a service</option>
              {services.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.name}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm text-muted">
            Request title
            <input
              required
              minLength={1}
              maxLength={150}
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="mt-2 w-full rounded-xl border border-border bg-surface-secondary p-3 text-foreground outline-none focus:border-primary"
            />
          </label>
          <label className="text-sm text-muted">
            Description
            <textarea
              required
              minLength={1}
              maxLength={10000}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className="mt-2 min-h-32 w-full rounded-xl border border-border bg-surface-secondary p-3 text-foreground outline-none focus:border-primary"
            />
          </label>
          <button
            disabled={submitting || services.length === 0}
            className="w-fit rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
          >
            {submitting ? 'Submitting...' : 'Submit request'}
          </button>
          {!loading && services.length === 0 && (
            <p className="text-sm text-muted">No active services are currently available.</p>
          )}
        </form>
        <section className="overflow-hidden rounded-2xl border border-border bg-surface">
          <div className="border-b border-border p-5">
            <h2 className="font-semibold text-white">Your requests</h2>
          </div>
          {loading ? (
            <p className="p-5 text-sm text-muted">Loading requests...</p>
          ) : requests.length === 0 ? (
            <p className="p-5 text-sm text-muted">You have not submitted any requests yet.</p>
          ) : (
            <div className="divide-y divide-border">
              {requests.map((request) => (
                <Link
                  key={request.id}
                  to={`/requests/${request.id}`}
                  className="block p-5 transition hover:bg-surface-secondary"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="font-medium text-white">{request.title}</h3>
                      <p className="mt-1 text-sm text-muted">
                        {request.service.name} · {request.description.slice(0, 120)}
                      </p>
                    </div>
                    <StatusBadge status={request.status} />
                  </div>
                  <p className="mt-3 text-xs text-muted">Updated {formatDate(request.updatedAt)}</p>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}

export function StatusBadge({ status }: { status: RequestStatus }) {
  const color =
    status === 'COMPLETED'
      ? 'bg-success/10 text-success'
      : status === 'CANCELLED'
        ? 'bg-error/10 text-error'
        : status === 'IN_PROGRESS'
          ? 'bg-warning/10 text-warning'
          : 'bg-primary/10 text-primary';
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${color}`}>
      {statusLabels[status]}
    </span>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function formatDate(value: string) {
  return new Date(value).toLocaleDateString();
}
