import { BookOpen, FileText, Pencil, Plus, Trash2, X } from 'lucide-react';
import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import AppShell from '../components/app/AppShell';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../services/api';

type WorkspaceContent = {
  id: string;
  title: string;
  content: string;
  type: string;
  updatedAt: string;
};

type Project = {
  id: string;
  name: string;
  _count?: { contents: number };
};

const contentTypes = ['NOTE', 'DOCUMENT', 'LINK', 'FILE'] as const;

export default function WorkspaceKnowledgePage() {
  const { workspace } = useAuth();
  const [items, setItems] = useState<WorkspaceContent[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [editing, setEditing] = useState<WorkspaceContent | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');

  const load = useCallback(async () => {
    if (!workspace) return;
    setLoading(true);
    setError('');
    try {
      const [workspaceContent, workspaceProjects] = await Promise.all([
        apiRequest<WorkspaceContent[]>(`/workspaces/${workspace.id}/content`),
        apiRequest<Project[]>(`/workspaces/${workspace.id}/projects`),
      ]);
      setItems(workspaceContent);
      setProjects(workspaceProjects);
    } catch {
      setError('Unable to load workspace knowledge. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [workspace]);

  useEffect(() => {
    // The initial request synchronizes the page with the authenticated workspace.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  const remove = async (id: string) => {
    if (!workspace || !window.confirm('Delete this workspace knowledge item?')) return;
    try {
      await apiRequest(`/workspaces/${workspace.id}/content/${id}`, { method: 'DELETE' });
      setFeedback('Workspace knowledge deleted.');
      await load();
    } catch {
      setError('Unable to delete this item. Please try again.');
    }
  };

  return (
    <AppShell>
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm text-primary">Shared workspace context</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Workspace Knowledge</h1>
          <p className="mt-2 max-w-2xl text-muted">
            Capture guidelines, product information, and team processes shared across your
            workspace.
          </p>
        </div>
        <button
          onClick={() => {
            setEditing(null);
            setShowForm(true);
            setFeedback('');
          }}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover"
        >
          <Plus className="h-4 w-4" /> Add knowledge
        </button>
      </div>

      {feedback && (
        <p
          role="status"
          className="mt-6 rounded-xl border border-success/30 bg-success/10 p-4 text-sm text-success"
        >
          {feedback}
        </p>
      )}
      {error && (
        <p
          role="alert"
          className="mt-6 rounded-xl border border-error/30 bg-error/10 p-4 text-sm text-error"
        >
          {error}
        </p>
      )}

      {showForm && (
        <WorkspaceContentForm
          initial={editing}
          onClose={() => setShowForm(false)}
          onSaved={async (message) => {
            setShowForm(false);
            setFeedback(message);
            await load();
          }}
        />
      )}

      <section className="mt-10">
        <div className="flex items-center gap-3">
          <BookOpen className="h-5 w-5 text-primary" />
          <div>
            <h2 className="text-lg font-semibold">Workspace Knowledge</h2>
            <p className="text-sm text-muted">Shared by everyone in {workspace?.name}.</p>
          </div>
        </div>

        {loading ? (
          <p className="mt-6 text-sm text-muted">Loading workspace knowledge...</p>
        ) : items.length === 0 && !showForm ? (
          <div className="mt-5 rounded-2xl border border-dashed border-border p-10 text-center">
            <FileText className="mx-auto h-8 w-8 text-muted" />
            <h3 className="mt-3 font-medium">No shared knowledge yet</h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted">
              Add general guidelines, product information, or team processes for your workspace.
            </p>
          </div>
        ) : (
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {items.map((item) => (
              <article key={item.id} className="rounded-2xl border border-border bg-surface p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="text-xs text-primary">{item.type}</span>
                    <h3 className="mt-2 font-medium">{item.title}</h3>
                  </div>
                  <div className="flex gap-2 text-muted">
                    <button
                      aria-label={`Edit ${item.title}`}
                      onClick={() => {
                        setEditing(item);
                        setShowForm(true);
                        setFeedback('');
                      }}
                      className="hover:text-foreground"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      aria-label={`Delete ${item.title}`}
                      onClick={() => void remove(item.id)}
                      className="hover:text-error"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <p className="mt-4 line-clamp-4 whitespace-pre-wrap text-sm leading-6 text-muted">
                  {item.content}
                </p>
                <p className="mt-4 text-xs text-muted">
                  Updated {new Date(item.updatedAt).toLocaleDateString()}
                </p>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="mt-12">
        <div className="flex items-center gap-3">
          <FileText className="h-5 w-5 text-primary" />
          <div>
            <h2 className="text-lg font-semibold">Project Knowledge</h2>
            <p className="text-sm text-muted">Knowledge specific to each project.</p>
          </div>
        </div>
        {projects.length === 0 ? (
          <p className="mt-5 rounded-2xl border border-dashed border-border p-8 text-sm text-muted">
            Create a project to start collecting project-specific knowledge.
          </p>
        ) : (
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {projects.map((project) => (
              <Link
                key={project.id}
                to={`/projects/${project.id}/content`}
                className="flex items-center justify-between rounded-2xl border border-border bg-surface p-5 transition hover:border-primary/60"
              >
                <div>
                  <h3 className="font-medium">{project.name}</h3>
                  <p className="mt-1 text-sm text-muted">
                    {project._count?.contents ?? 0} knowledge items
                  </p>
                </div>
                <span className="text-sm text-primary">Open</span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </AppShell>
  );
}

function WorkspaceContentForm({
  initial,
  onClose,
  onSaved,
}: {
  initial: WorkspaceContent | null;
  onClose: () => void;
  onSaved: (message: string) => Promise<void>;
}) {
  const { workspace } = useAuth();
  const [title, setTitle] = useState(initial?.title ?? '');
  const [content, setContent] = useState(initial?.content ?? '');
  const [type, setType] = useState(initial?.type ?? 'NOTE');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const save = async (event: FormEvent) => {
    event.preventDefault();
    if (!workspace) return;
    if (!title.trim() || !content.trim()) {
      setError('Title and content are required.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      await apiRequest(
        initial
          ? `/workspaces/${workspace.id}/content/${initial.id}`
          : `/workspaces/${workspace.id}/content`,
        {
          method: initial ? 'PATCH' : 'POST',
          body: { title, content, type },
        },
      );
      await onSaved(initial ? 'Workspace knowledge updated.' : 'Workspace knowledge added.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save this item.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={save} className="mt-6 rounded-2xl border border-border bg-surface p-5">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">
          {initial ? 'Edit workspace knowledge' : 'Add workspace knowledge'}
        </h2>
        <button type="button" onClick={onClose} aria-label="Close form">
          <X className="h-5 w-5 text-muted" />
        </button>
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_180px]">
        <input
          required
          maxLength={250}
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Title"
          className="rounded-xl border border-border bg-surface-secondary px-4 py-3 text-sm outline-none focus:border-primary"
        />
        <select
          value={type}
          onChange={(event) => setType(event.target.value)}
          className="rounded-xl border border-border bg-surface-secondary px-4 py-3 text-sm outline-none focus:border-primary"
        >
          {contentTypes.map((contentType) => (
            <option key={contentType} value={contentType}>
              {contentType}
            </option>
          ))}
        </select>
      </div>
      <textarea
        required
        rows={7}
        maxLength={50000}
        value={content}
        onChange={(event) => setContent(event.target.value)}
        placeholder="Write shared workspace knowledge..."
        className="mt-4 w-full rounded-xl border border-border bg-surface-secondary px-4 py-3 text-sm outline-none focus:border-primary"
      />
      {error && <p className="mt-3 text-sm text-error">{error}</p>}
      <button
        disabled={busy}
        className="mt-4 rounded-xl bg-primary px-4 py-2 text-sm font-semibold disabled:opacity-60"
      >
        {busy ? 'Saving...' : 'Save knowledge'}
      </button>
    </form>
  );
}
