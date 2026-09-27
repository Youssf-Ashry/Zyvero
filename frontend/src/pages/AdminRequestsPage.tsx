import { Link, useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import AppShell from '../components/app/AppShell';
import { apiRequest } from '../services/api';
import { formatDate, StatusBadge } from './RequestsPage';

type Status = 'NEW' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
type RequestItem = {
  id: string;
  title: string;
  status: Status;
  createdAt: string;
  updatedAt: string;
  service: { id: string; name: string };
  customer: { name: string; email: string };
};
type Service = { id: string; name: string };

const filters = [
  { label: 'All', value: '' },
  { label: 'New', value: 'NEW' },
  { label: 'In Progress', value: 'IN_PROGRESS' },
  { label: 'Completed', value: 'COMPLETED' },
  { label: 'Cancelled', value: 'CANCELLED' },
];

export default function AdminRequestsPage() {
  const [params, setParams] = useSearchParams();
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const search = params.get('search') ?? '';
  const status = params.get('status') ?? '';
  const serviceId = params.get('serviceId') ?? '';
  const dateRange = params.get('dateRange') ?? '';

  useEffect(() => {
    apiRequest<Service[]>('/admin/services')
      .then(setServices)
      .catch(() => setError('Unable to load service filters.'));
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    setError('');
    const query = params.toString();
    apiRequest<RequestItem[]>(`/admin/requests${query ? `?${query}` : ''}`)
      .then(setRequests)
      .catch((err) => setError(err instanceof Error ? err.message : 'Unable to load requests.'))
      .finally(() => setLoading(false));
  }, [params]);

  const setFilter = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next);
  };

  const clearFilters = () => setParams({});

  return (
    <AppShell>
      <div className="space-y-8">
        <header>
          <p className="text-xs uppercase tracking-[0.2em] text-primary">Administration</p>
          <h1 className="mt-3 text-3xl font-semibold text-white">Customer Requests</h1>
          <p className="mt-2 text-muted">Review and manage incoming service requests.</p>
        </header>
        <div className="grid gap-3 rounded-2xl border border-border bg-surface p-5 md:grid-cols-2 lg:grid-cols-4">
          <input
            value={search}
            onChange={(event) => setFilter('search', event.target.value)}
            placeholder="Search requests, customers, services..."
            className="rounded-xl border border-border bg-surface-secondary p-3 text-sm text-foreground outline-none focus:border-primary lg:col-span-2"
          />
          <select
            value={status}
            onChange={(event) => setFilter('status', event.target.value)}
            className="rounded-xl border border-border bg-surface-secondary p-3 text-sm text-foreground outline-none focus:border-primary"
          >
            <option value="">All statuses</option>
            {filters.slice(1).map((filter) => (
              <option key={filter.value} value={filter.value}>
                {filter.label}
              </option>
            ))}
          </select>
          <select
            value={serviceId}
            onChange={(event) => setFilter('serviceId', event.target.value)}
            className="rounded-xl border border-border bg-surface-secondary p-3 text-sm text-foreground outline-none focus:border-primary"
          >
            <option value="">All services</option>
            {services.map((service) => (
              <option key={service.id} value={service.id}>
                {service.name}
              </option>
            ))}
          </select>
          <select
            value={dateRange}
            onChange={(event) => setFilter('dateRange', event.target.value)}
            className="rounded-xl border border-border bg-surface-secondary p-3 text-sm text-foreground outline-none focus:border-primary"
          >
            <option value="">All dates</option>
            <option value="TODAY">Today</option>
            <option value="LAST_7_DAYS">Last 7 days</option>
            <option value="LAST_30_DAYS">Last 30 days</option>
          </select>
          <button
            onClick={clearFilters}
            className="w-fit rounded-xl border border-border px-4 py-3 text-sm text-muted hover:border-primary hover:text-white"
          >
            Clear filters
          </button>
        </div>
        <div className="flex items-center justify-between text-sm text-muted">
          <span>
            {requests.length} result{requests.length === 1 ? '' : 's'}
          </span>
          {params.toString() && <span>Active filters applied</span>}
        </div>
        {error && (
          <p className="rounded-xl border border-error/40 bg-error/10 p-4 text-sm text-error">
            {error}
          </p>
        )}
        <section className="overflow-hidden rounded-2xl border border-border bg-surface">
          {loading ? (
            <p className="p-5 text-sm text-muted">Loading requests...</p>
          ) : requests.length === 0 ? (
            <p className="p-5 text-sm text-muted">
              No requests found. Try changing your search or filters.
            </p>
          ) : (
            <div className="divide-y divide-border">
              {requests.map((request) => (
                <Link
                  key={request.id}
                  to={`/admin/requests/${request.id}`}
                  className="block p-5 hover:bg-surface-secondary"
                >
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <h2 className="font-medium text-white">{request.title}</h2>
                      <p className="mt-1 text-sm text-muted">
                        {request.customer.name} · {request.customer.email} · {request.service.name}
                      </p>
                    </div>
                    <StatusBadge status={request.status} />
                  </div>
                  <p className="mt-3 text-xs text-muted">
                    Created {formatDate(request.createdAt)} · Updated{' '}
                    {formatDate(request.updatedAt)}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}
