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
  service: { name: string };
  customer: { name: string; email: string };
};
const filters: Array<{ label: string; value: '' | Status }> = [
  { label: 'All', value: '' },
  { label: 'New', value: 'NEW' },
  { label: 'In Progress', value: 'IN_PROGRESS' },
  { label: 'Completed', value: 'COMPLETED' },
  { label: 'Cancelled', value: 'CANCELLED' },
];

export default function AdminRequestsPage() {
  const [params, setParams] = useSearchParams();
  const status = (params.get('status') ?? '') as '' | Status;
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    apiRequest<RequestItem[]>(`/admin/requests${status ? `?status=${status}` : ''}`)
      .then(setRequests)
      .catch((err) => setError(err instanceof Error ? err.message : 'Unable to load requests.'))
      .finally(() => setLoading(false));
  }, [status]);
  return (
    <AppShell>
      <div className="space-y-8">
        <header>
          <p className="text-xs uppercase tracking-[0.2em] text-primary">Administration</p>
          <h1 className="mt-3 text-3xl font-semibold text-white">Customer Requests</h1>
          <p className="mt-2 text-muted">Review and manage incoming service requests.</p>
        </header>
        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => (
            <button
              key={filter.label}
              onClick={() => {
                if (filter.value) setParams({ status: filter.value });
                else setParams({});
              }}
              className={`rounded-full border px-3 py-2 text-xs ${status === filter.value ? 'border-primary bg-primary/15 text-white' : 'border-border text-muted hover:text-white'}`}
            >
              {filter.label}
            </button>
          ))}
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
            <p className="p-5 text-sm text-muted">No requests match this filter.</p>
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
