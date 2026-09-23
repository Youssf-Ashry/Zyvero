import { Link, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import AppShell from '../components/app/AppShell';
import { apiRequest } from '../services/api';
import { formatDate, StatusBadge } from './RequestsPage';

type Status = 'NEW' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
type RequestItem = {
  id: string;
  title: string;
  description: string;
  status: Status;
  createdAt: string;
  updatedAt: string;
  service: { name: string };
  customer: { name: string; email: string };
};
const statuses: Status[] = ['NEW', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];

export default function AdminRequestDetailsPage() {
  const { id } = useParams();
  const [request, setRequest] = useState<RequestItem | null>(null);
  const [status, setStatus] = useState<Status>('NEW');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    if (!id) return;
    apiRequest<RequestItem>(`/admin/requests/${id}`)
      .then((data) => {
        setRequest(data);
        setStatus(data.status);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Unable to load request.'));
  }, [id]);
  const save = async () => {
    if (!id) return;
    setBusy(true);
    setError('');
    try {
      const updated = await apiRequest<RequestItem>(`/admin/requests/${id}/status`, {
        method: 'PATCH',
        body: { status },
      });
      setRequest(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update status.');
    } finally {
      setBusy(false);
    }
  };
  return (
    <AppShell>
      <div className="mx-auto max-w-3xl space-y-6">
        <Link to="/admin/requests" className="text-sm text-primary hover:text-white">
          ← Back to Customer Requests
        </Link>
        {error && (
          <p className="rounded-xl border border-error/40 bg-error/10 p-4 text-sm text-error">
            {error}
          </p>
        )}
        {!request && !error && <p className="text-sm text-muted">Loading request...</p>}
        {request && (
          <article className="rounded-2xl border border-border bg-surface p-6">
            <div className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-primary">
                  {request.service.name}
                </p>
                <h1 className="mt-3 text-3xl font-semibold text-white">{request.title}</h1>
                <p className="mt-2 text-sm text-muted">
                  {request.customer.name} · {request.customer.email}
                </p>
              </div>
              <StatusBadge status={request.status} />
            </div>
            <p className="mt-6 whitespace-pre-wrap leading-7 text-muted">{request.description}</p>
            <div className="mt-8 grid gap-4 border-t border-border pt-6 text-sm sm:grid-cols-2">
              <div>
                <p className="text-muted">Created</p>
                <p className="mt-1 text-foreground">{formatDate(request.createdAt)}</p>
              </div>
              <div>
                <p className="text-muted">Updated</p>
                <p className="mt-1 text-foreground">{formatDate(request.updatedAt)}</p>
              </div>
            </div>
            <div className="mt-8 border-t border-border pt-6">
              <label className="text-sm text-muted">
                Update status
                <select
                  value={status}
                  onChange={(event) => setStatus(event.target.value as Status)}
                  className="mt-2 w-full rounded-xl border border-border bg-surface-secondary p-3 text-foreground outline-none focus:border-primary"
                >
                  {statuses.map((value) => (
                    <option key={value} value={value}>
                      {value.replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </label>
              <button
                disabled={busy || status === request.status}
                onClick={() => void save()}
                className="mt-4 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
              >
                {busy ? 'Saving...' : 'Update status'}
              </button>
            </div>
          </article>
        )}
      </div>
    </AppShell>
  );
}
