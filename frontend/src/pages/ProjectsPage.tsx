import { Link, useSearchParams } from 'react-router-dom';
import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Pencil, Plus, Trash2, Users } from 'lucide-react';
import AppShell from '../components/app/AppShell';
import { useAuth } from '../context/AuthContext';
import {
  createProject,
  deleteProject,
  getProjects,
  getWorkspaceMembers,
  updateProject,
  type ProjectInput,
  type ProjectRecord,
  type ProjectStatus,
  type WorkspaceMember,
} from '../services/api';

const statuses: ProjectStatus[] = ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'ON_HOLD'];

export default function ProjectsPage() {
  const { workspace, hasWorkspacePermission } = useAuth();
  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [editing, setEditing] = useState<ProjectRecord | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [params] = useSearchParams();
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');
  const canCreate = hasWorkspacePermission('PROJECT_CREATE', workspace?.id);
  const canUpdate = hasWorkspacePermission('PROJECT_UPDATE', workspace?.id);
  const canDelete = hasWorkspacePermission('PROJECT_DELETE', workspace?.id);
  const canAssign = hasWorkspacePermission('PROJECT_ASSIGN', workspace?.id);

  const load = useCallback(async () => {
    if (!workspace) return;
    setError('');
    try {
      setProjects(await getProjects(workspace.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load projects.');
    }
  }, [workspace]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  useEffect(() => {
    if (!workspace || !canAssign) return;
    getWorkspaceMembers(workspace.id)
      .then((result) => setMembers(result.members))
      .catch(() => setError('Unable to load workspace members.'));
  }, [canAssign, workspace]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (params.get('new') === '1' && canCreate) setShowForm(true);
  }, [canCreate, params]);

  const remove = async (project: ProjectRecord) => {
    if (!workspace || !window.confirm(`Delete "${project.name}" and its tasks?`)) return;
    try {
      await deleteProject(workspace.id, project.id);
      setFeedback('Project deleted.');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to delete project.');
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
        {canCreate && (
          <button
            onClick={() => {
              setEditing(null);
              setShowForm((value) => !value);
            }}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover"
          >
            <Plus className="h-4 w-4" /> New project
          </button>
        )}
      </div>
      {feedback && <p className="mt-6 rounded-xl border border-success/30 bg-success/10 p-4 text-sm text-success">{feedback}</p>}
      {error && <p className="mt-6 rounded-xl border border-error/30 bg-error/10 p-4 text-sm text-error">{error}</p>}
      {showForm && workspace && (
        <ProjectForm
          workspaceId={workspace.id}
          initial={editing}
          members={members}
          canAssign={canAssign}
          onClose={() => setShowForm(false)}
          onSaved={async (message) => {
            setShowForm(false);
            setEditing(null);
            setFeedback(message);
            await load();
          }}
        />
      )}
      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {projects.map((project) => (
          <article key={project.id} className="rounded-2xl border border-border bg-surface p-5 hover:border-primary/50">
            <Link to={`/projects/${project.id}`}>
              <div className="flex items-start justify-between gap-3">
                <h2 className="font-medium">{project.name}</h2>
                <span className="rounded-full bg-primary/10 px-2 py-1 text-[11px] text-primary">
                  {statusLabel(project.status)}
                </span>
              </div>
              <p className="mt-3 min-h-10 text-sm text-muted">{project.description || 'No description yet.'}</p>
              <div className="mt-5 flex items-center justify-between text-xs text-muted">
                <span>{project.progress}% complete · {project.taskCount} tasks</span>
                <span>{project.client?.name ?? 'No client'}</span>
              </div>
              <p className="mt-2 flex items-center gap-1 text-xs text-muted">
                <Users className="h-3.5 w-3.5" /> {project.teamMembers.length} team member{project.teamMembers.length === 1 ? '' : 's'}
              </p>
            </Link>
            <div className="mt-4 flex gap-4 text-xs text-muted">
              {canUpdate && (
                <button onClick={() => { setEditing(project); setShowForm(true); }} className="inline-flex items-center gap-1 hover:text-foreground">
                  <Pencil className="h-3.5 w-3.5" /> Edit
                </button>
              )}
              {canDelete && (
                <button onClick={() => void remove(project)} className="inline-flex items-center gap-1 hover:text-error">
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </button>
              )}
            </div>
          </article>
        ))}
      </div>
      {projects.length === 0 && <div className="mt-8 rounded-2xl border border-dashed border-border p-12 text-center text-muted">No projects yet. Create one to get started.</div>}
    </AppShell>
  );
}

function ProjectForm({
  workspaceId,
  initial,
  members,
  canAssign,
  onClose,
  onSaved,
}: {
  workspaceId: string;
  initial: ProjectRecord | null;
  members: WorkspaceMember[];
  canAssign: boolean;
  onClose: () => void;
  onSaved: (message: string) => Promise<void>;
}) {
  const [name, setName] = useState(initial?.name ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [status, setStatus] = useState<ProjectStatus>(initial?.status ?? 'NOT_STARTED');
  const [clientId, setClientId] = useState(initial?.client?.id ?? '');
  const [memberIds, setMemberIds] = useState<string[]>(initial?.teamMembers.map((member) => member.id) ?? []);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!name.trim()) return setError('Project name is required.');
    setBusy(true);
    setError('');
    const data: ProjectInput = {
      name,
      description,
      status,
      ...(canAssign ? { clientId: clientId || null, projectMemberIds: memberIds } : {}),
    };
    try {
      if (initial) await updateProject(workspaceId, initial.id, data);
      else await createProject(workspaceId, { name, description, status, ...(canAssign ? { clientId: clientId || undefined, projectMemberIds: memberIds } : {}) });
      await onSaved(initial ? 'Project updated.' : 'Project created.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save project.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="mt-6 rounded-2xl border border-border bg-surface p-5">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">{initial ? 'Edit project' : 'Create a project'}</h2>
        <button type="button" onClick={onClose} className="text-sm text-muted hover:text-foreground">Cancel</button>
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <input required maxLength={150} value={name} onChange={(event) => setName(event.target.value)} placeholder="Project name" className="rounded-xl border border-border bg-surface-secondary px-4 py-3 text-sm outline-none focus:border-primary" />
        <select value={status} onChange={(event) => setStatus(event.target.value as ProjectStatus)} className="rounded-xl border border-border bg-surface-secondary px-4 py-3 text-sm outline-none focus:border-primary">
          {statuses.map((value) => <option key={value} value={value}>{statusLabel(value)}</option>)}
        </select>
      </div>
      <textarea rows={3} maxLength={5000} value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Description" className="mt-4 w-full rounded-xl border border-border bg-surface-secondary px-4 py-3 text-sm outline-none focus:border-primary" />
      {canAssign && (
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <select value={clientId} onChange={(event) => setClientId(event.target.value)} className="rounded-xl border border-border bg-surface-secondary px-4 py-3 text-sm outline-none focus:border-primary">
            <option value="">No client selected</option>
            {members.map((member) => <option key={member.id} value={member.id}>{member.name} ({member.email})</option>)}
          </select>
          <select multiple value={memberIds} onChange={(event) => setMemberIds(Array.from(event.target.selectedOptions, (option) => option.value))} className="min-h-28 rounded-xl border border-border bg-surface-secondary px-4 py-3 text-sm outline-none focus:border-primary">
            {members.map((member) => <option key={member.id} value={member.id}>{member.name}</option>)}
          </select>
        </div>
      )}
      {canAssign && <p className="mt-2 text-xs text-muted">Hold Ctrl/Cmd to select multiple team members.</p>}
      {error && <p className="mt-3 text-sm text-error">{error}</p>}
      <button disabled={busy} className="mt-4 rounded-xl bg-primary px-4 py-2 text-sm font-semibold disabled:opacity-60">{busy ? 'Saving...' : initial ? 'Save changes' : 'Create project'}</button>
    </form>
  );
}

function statusLabel(status: ProjectStatus) {
  return status.replace('_', ' ');
}
