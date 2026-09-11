import { FolderKanban, ListTodo, Plus, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import AppShell from '../components/app/AppShell';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../services/api';

type Project = {
  id: string;
  name: string;
  description?: string;
  status: string;
  createdAt: string;
  _count?: { tasks: number; contents: number };
};

export default function DashboardPage() {
  const { workspace } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    if (!workspace) return;
    apiRequest<Project[]>(`/workspaces/${workspace.id}/projects`)
      .then(setProjects)
      .catch(() => setError('Unable to load your dashboard.'))
      .finally(() => setLoading(false));
  }, [workspace]);
  const taskCount = projects.reduce((sum, project) => sum + (project._count?.tasks ?? 0), 0);
  return (
    <AppShell>
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm text-primary">Workspace overview</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            Good to see you, {useAuth().user?.name.split(' ')[0]}.
          </h1>
          <p className="mt-2 text-muted">Keep momentum across your team&apos;s work.</p>
        </div>
        <Link
          to="/projects?new=1"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover"
        >
          <Plus className="h-4 w-4" /> New project
        </Link>
      </div>
      {error && (
        <p className="mt-6 rounded-xl border border-error/30 bg-error/10 p-4 text-sm text-error">
          {error}
        </p>
      )}
      {loading ? (
        <p className="mt-10 text-muted">Loading your workspace...</p>
      ) : (
        <>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <Metric label="Projects" value={projects.length} icon={<FolderKanban />} />
            <Metric label="Tasks" value={taskCount} icon={<ListTodo />} />
            <Metric label="Workspace" value={workspace?.name ?? 'Workspace'} icon={<Sparkles />} />
          </div>
          <section className="mt-10">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Recent projects</h2>
              <Link to="/projects" className="text-sm text-primary hover:text-primary-hover">
                View all
              </Link>
            </div>
            {projects.length === 0 ? (
              <Empty
                title="Your workspace is ready"
                text="Create your first project to start turning ideas into momentum."
                action={
                  <Link to="/projects?new=1" className="text-primary">
                    Create a project
                  </Link>
                }
              />
            ) : (
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                {projects.slice(0, 4).map((project) => (
                  <Link
                    key={project.id}
                    to={`/projects/${project.id}`}
                    className="rounded-2xl border border-border bg-surface p-5 transition hover:border-primary/60"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="font-medium">{project.name}</h3>
                      <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs text-primary">
                        {project.status}
                      </span>
                    </div>
                    <p className="mt-2 line-clamp-2 text-sm text-muted">
                      {project.description || 'No description yet.'}
                    </p>
                    <p className="mt-5 text-xs text-muted">
                      {project._count?.tasks ?? 0} tasks · {project._count?.contents ?? 0} knowledge
                      items
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </AppShell>
  );
}
function Metric({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <div className="flex items-center justify-between text-muted">
        <span className="text-sm">{label}</span>
        <span className="text-primary">{icon}</span>
      </div>
      <p className="mt-4 text-3xl font-semibold">{value}</p>
    </div>
  );
}
function Empty({ title, text, action }: { title: string; text: string; action: React.ReactNode }) {
  return (
    <div className="mt-4 rounded-2xl border border-dashed border-border bg-surface p-10 text-center">
      <h3 className="font-medium">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted">{text}</p>
      <div className="mt-4 text-sm">{action}</div>
    </div>
  );
}
