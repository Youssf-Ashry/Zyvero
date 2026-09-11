import { Link, useSearchParams } from 'react-router-dom';
import { useCallback, useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import AppShell from '../components/app/AppShell';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../services/api';

type Project = {
  id: string;
  name: string;
  description?: string;
  status: string;
  _count?: { tasks: number; contents: number };
};
export default function ProjectsPage() {
  const { workspace } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [params] = useSearchParams();
  const [showForm, setShowForm] = useState(() => params.get('new') === '1');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const load = useCallback(
    () =>
      workspace &&
      apiRequest<Project[]>(`/workspaces/${workspace.id}/projects`)
        .then(setProjects)
        .catch(() => setError('Unable to load projects.')),
    [workspace],
  );
  useEffect(() => {
    void load();
  }, [load]);
  const create = async (event: FormEvent) => {
    event.preventDefault();
    if (!workspace) return;
    setBusy(true);
    setError('');
    try {
      await apiRequest(`/workspaces/${workspace.id}/projects`, {
        method: 'POST',
        body: { name, description },
      });
      setName('');
      setDescription('');
      setShowForm(false);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create project.');
    } finally {
      setBusy(false);
    }
  };
  const remove = async (id: string) => {
    if (!workspace || !window.confirm('Delete this project and its tasks?')) return;
    try {
      await apiRequest(`/workspaces/${workspace.id}/projects/${id}`, { method: 'DELETE' });
      await load();
    } catch {
      setError('Unable to delete project.');
    }
  };
  return (
    <AppShell>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm text-primary">Workspace</p>
          <h1 className="mt-2 text-3xl font-semibold">Projects</h1>
          <p className="mt-2 text-muted">A clear home for every team initiative.</p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover"
        >
          <Plus className="h-4 w-4" /> New project
        </button>
      </div>
      {error && (
        <p className="mt-6 rounded-xl border border-error/30 bg-error/10 p-4 text-sm text-error">
          {error}
        </p>
      )}
      {showForm && (
        <form onSubmit={create} className="mt-6 rounded-2xl border border-border bg-surface p-5">
          <h2 className="font-semibold">Create a project</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <input
              required
              placeholder="Project name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-xl border border-border bg-surface-secondary px-4 py-3 text-sm outline-none focus:border-primary"
            />
            <input
              placeholder="Short description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="rounded-xl border border-border bg-surface-secondary px-4 py-3 text-sm outline-none focus:border-primary"
            />
          </div>
          <button
            disabled={busy}
            className="mt-4 rounded-xl bg-primary px-4 py-2 text-sm font-semibold disabled:opacity-60"
          >
            {busy ? 'Creating...' : 'Create project'}
          </button>
        </form>
      )}
      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {projects.map((project) => (
          <div
            key={project.id}
            className="group rounded-2xl border border-border bg-surface p-5 hover:border-primary/50"
          >
            <Link to={`/projects/${project.id}`}>
              <div className="flex items-start justify-between gap-3">
                <h2 className="font-medium">{project.name}</h2>
                <span className="rounded-full bg-primary/10 px-2 py-1 text-[11px] text-primary">
                  {project.status}
                </span>
              </div>
              <p className="mt-3 min-h-10 text-sm text-muted">
                {project.description || 'No description yet.'}
              </p>
              <p className="mt-5 text-xs text-muted">
                {project._count?.tasks ?? 0} tasks · {project._count?.contents ?? 0} knowledge items
              </p>
            </Link>
            <button
              onClick={() => void remove(project.id)}
              className="mt-4 flex items-center gap-2 text-xs text-muted hover:text-error"
            >
              <Trash2 className="h-3.5 w-3.5" /> Delete
            </button>
          </div>
        ))}
      </div>
      {projects.length === 0 && (
        <div className="mt-8 rounded-2xl border border-dashed border-border p-12 text-center text-muted">
          No projects yet. Create one to get started.
        </div>
      )}
    </AppShell>
  );
}
