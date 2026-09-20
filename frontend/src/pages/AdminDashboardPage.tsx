import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Layers3, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { apiRequest } from '../services/api';
import AppShell from '../components/app/AppShell';

type Service = { id: string; name: string; isActive: boolean };

export default function AdminDashboardPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [error, setError] = useState('');
  useEffect(() => {
    apiRequest<Service[]>('/admin/services')
      .then(setServices)
      .catch(() => setError('Unable to load service metrics.'));
  }, []);
  const active = services.filter((service) => service.isActive).length;
  return (
    <AppShell>
      <div className="space-y-8">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-primary">Administration</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-white">
            Company services
          </h1>
          <p className="mt-2 text-muted">Manage the services shown on the public Zyvero website.</p>
        </div>
        {error && (
          <p className="rounded-xl border border-error/40 bg-error/10 p-4 text-sm text-error">
            {error}
          </p>
        )}
        <div className="grid gap-4 sm:grid-cols-3">
          <Metric label="Total services" value={services.length} icon={Layers3} />
          <Metric label="Active" value={active} icon={CheckCircle2} />
          <Metric label="Inactive" value={services.length - active} icon={XCircle} />
        </div>
        <Link
          to="/admin/services"
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white hover:bg-primary-hover"
        >
          Manage services <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </AppShell>
  );
}

function Metric({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: typeof Layers3;
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <Icon className="h-5 w-5 text-primary" />
      <p className="mt-5 text-sm text-muted">{label}</p>
      <p className="mt-1 text-3xl font-semibold text-white">{value}</p>
    </div>
  );
}
