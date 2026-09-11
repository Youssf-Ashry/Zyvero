import { ArrowLeft, BookOpen, Pencil, Plus, Trash2, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import AppShell from '../components/app/AppShell';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../services/api';
type Content = { id: string; title: string; content: string; type: string; url?: string };
export default function ProjectContentPage() {
  const { id } = useParams();
  const { workspace } = useAuth();
  const [items, setItems] = useState<Content[]>([]);
  const [editing, setEditing] = useState<Content | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const load = useCallback(
    () =>
      workspace &&
      id &&
      apiRequest<Content[]>(`/workspaces/${workspace.id}/projects/${id}/content`)
        .then(setItems)
        .catch(() => setError('Unable to load knowledge items.')),
    [workspace, id],
  );
  useEffect(() => {
    void load();
  }, [load]);
  const remove = async (contentId: string) => {
    if (!workspace || !id || !window.confirm('Delete this knowledge item?')) return;
    try {
      await apiRequest(`/workspaces/${workspace.id}/projects/${id}/content/${contentId}`, {
        method: 'DELETE',
      });
      await load();
    } catch {
      setError('Unable to delete this item.');
    }
  };
  return (
    <AppShell>
      <Link
        to={`/projects/${id}`}
        className="inline-flex items-center gap-2 text-sm text-muted hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back to project
      </Link>
      <div className="mt-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm text-primary">Project knowledge</p>
          <h1 className="mt-2 text-3xl font-semibold">Content</h1>
          <p className="mt-2 text-muted">Capture the decisions and context your team needs.</p>
        </div>
        <button
          onClick={() => {
            setEditing(null);
            setShowForm(true);
          }}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover"
        >
          <Plus className="h-4 w-4" /> Add content
        </button>
      </div>
      {error && (
        <p className="mt-6 rounded-xl border border-error/30 bg-error/10 p-4 text-sm text-error">
          {error}
        </p>
      )}
      {showForm && (
        <ContentForm
          initial={editing}
          onClose={() => setShowForm(false)}
          onSaved={async () => {
            setShowForm(false);
            await load();
          }}
        />
      )}
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {items.map((item) => (
          <article key={item.id} className="rounded-2xl border border-border bg-surface p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-xs text-primary">{item.type}</span>
                <h2 className="mt-2 font-medium">{item.title}</h2>
              </div>
              <div className="flex gap-2 text-muted">
                <button
                  aria-label="Edit content"
                  onClick={() => {
                    setEditing(item);
                    setShowForm(true);
                  }}
                  className="hover:text-foreground"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  aria-label="Delete content"
                  onClick={() => void remove(item.id)}
                  className="hover:text-error"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-muted"> {item.content}</p>
          </article>
        ))}
      </div>
      {items.length === 0 && !showForm && (
        <div className="mt-8 rounded-2xl border border-dashed border-border p-12 text-center">
          <BookOpen className="mx-auto h-8 w-8 text-muted" />
          <p className="mt-3 text-sm text-muted">No content yet. Add your first project note.</p>
        </div>
      )}
    </AppShell>
  );
}
function ContentForm({
  initial,
  onClose,
  onSaved,
}: {
  initial: Content | null;
  onClose: () => void;
  onSaved: () => Promise<void>;
}) {
  const { workspace } = useAuth();
  const { id } = useParams();
  const [title, setTitle] = useState(initial?.title ?? '');
  const [content, setContent] = useState(initial?.content ?? '');
  const [type, setType] = useState(initial?.type ?? 'NOTE');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const save = async (event: FormEvent) => {
    event.preventDefault();
    if (!workspace || !id) return;
    setBusy(true);
    setError('');
    try {
      await apiRequest(
        initial
          ? `/workspaces/${workspace.id}/projects/${id}/content/${initial.id}`
          : `/workspaces/${workspace.id}/projects/${id}/content`,
        { method: initial ? 'PATCH' : 'POST', body: { title, content, type } },
      );
      await onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save content.');
    } finally {
      setBusy(false);
    }
  };
  return (
    <form onSubmit={save} className="mt-6 rounded-2xl border border-border bg-surface p-5">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">{initial ? 'Edit content' : 'Add content'}</h2>
        <button type="button" onClick={onClose} aria-label="Close form">
          <X className="h-5 w-5 text-muted" />
        </button>
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_180px]">
        <input
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          className="rounded-xl border border-border bg-surface-secondary px-4 py-3 text-sm outline-none focus:border-primary"
        />
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="rounded-xl border border-border bg-surface-secondary px-4 py-3 text-sm outline-none focus:border-primary"
        >
          <option value="NOTE">Note</option>
          <option value="DOCUMENT">Document</option>
          <option value="LINK">Link</option>
          <option value="FILE">File</option>
        </select>
      </div>
      <textarea
        required
        rows={7}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write the project knowledge here..."
        className="mt-4 w-full rounded-xl border border-border bg-surface-secondary px-4 py-3 text-sm outline-none focus:border-primary"
      />
      {error && <p className="mt-3 text-sm text-error">{error}</p>}
      <button
        disabled={busy}
        className="mt-4 rounded-xl bg-primary px-4 py-2 text-sm font-semibold disabled:opacity-60"
      >
        {busy ? 'Saving...' : 'Save content'}
      </button>
    </form>
  );
}
