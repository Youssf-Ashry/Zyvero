import { Link, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import AppShell from '../components/app/AppShell';
import { apiRequest } from '../services/api';
import { formatDate, StatusBadge } from './RequestsPage';

type RequestItem = {
  id: string;
  title: string;
  description: string;
  status: 'NEW' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
  updatedAt: string;
  service: { name: string };
  customer: { name: string; email: string };
};

export default function RequestDetailsPage() {
  const { id } = useParams();
  const [request, setRequest] = useState<RequestItem | null>(null);
  const [error, setError] = useState('');
  useEffect(() => {
    if (!id) return;
    apiRequest<RequestItem>(`/requests/${id}`)
      .then(setRequest)
      .catch((err) => setError(err instanceof Error ? err.message : 'Unable to load request.'));
  }, [id]);
  return (
    <AppShell>
      <div className="mx-auto max-w-3xl space-y-6">
        <Link to="/requests" className="text-sm text-primary hover:text-white">
          ← Back to My Requests
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
              </div>
              <StatusBadge status={request.status} />
            </div>
            <p className="mt-6 whitespace-pre-wrap leading-7 text-muted">{request.description}</p>
            <dl className="mt-8 grid gap-4 border-t border-border pt-6 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-muted">Submitted</dt>
                <dd className="mt-1 text-foreground">{formatDate(request.createdAt)}</dd>
              </div>
              <div>
                <dt className="text-muted">Last updated</dt>
                <dd className="mt-1 text-foreground">{formatDate(request.updatedAt)}</dd>
              </div>
              <div>
                <dt className="text-muted">Customer</dt>
                <dd className="mt-1 text-foreground">
                  {request.customer.name} · {request.customer.email}
                </dd>
              </div>
            </dl>
          </article>
        )}
      </div>
    </AppShell>
  );
}
