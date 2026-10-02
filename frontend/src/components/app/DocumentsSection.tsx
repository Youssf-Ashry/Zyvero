import {
  AlertCircle,
  Download,
  FileText,
  FolderOpen,
  LoaderCircle,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { useCallback, useEffect, useState, type FormEvent } from 'react';
import {
  apiDownload,
  deleteDocument,
  getDocuments,
  uploadDocument,
  type DocumentRecord,
} from '../../services/api';
import { useAuth } from '../../context/AuthContext';

type ProjectOption = { id: string; name: string };
const maxSize = 10 * 1024 * 1024;
const allowedExtensions = ['.pdf', '.doc', '.docx', '.txt'];

export default function DocumentsSection({
  workspaceId,
  projectId,
  projects = [],
}: {
  workspaceId: string;
  projectId?: string;
  projects?: ProjectOption[];
}) {
  const { hasWorkspacePermission } = useAuth();
  const canView = hasWorkspacePermission('KNOWLEDGE_VIEW', workspaceId);
  const canCreate = hasWorkspacePermission('KNOWLEDGE_CREATE', workspaceId);
  const canDelete = hasWorkspacePermission('KNOWLEDGE_DELETE', workspaceId);
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');
  const [showUpload, setShowUpload] = useState(false);
  const [downloadId, setDownloadId] = useState('');
  const [deletingId, setDeletingId] = useState('');

  const load = useCallback(async () => {
    if (!canView) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const result = await getDocuments(workspaceId, projectId);
      setDocuments(
        result.filter((document) =>
          projectId ? document.project?.id === projectId : document.project === null,
        ),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load documents.');
    } finally {
      setLoading(false);
    }
  }, [canView, projectId, workspaceId]);

  useEffect(() => {
    // The list synchronizes with the selected workspace and project.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  if (!canView) return null;

  const download = async (document: DocumentRecord) => {
    setDownloadId(document.id);
    setError('');
    try {
      const blob = await apiDownload(
        `/workspaces/${workspaceId}/documents/${document.id}/download`,
      );
      const url = URL.createObjectURL(blob);
      const anchor = window.document.createElement('a');
      anchor.href = url;
      anchor.download = document.originalName;
      anchor.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to download document.');
    } finally {
      setDownloadId('');
    }
  };

  const remove = async (document: DocumentRecord) => {
    if (!window.confirm(`Delete "${document.originalName}"?\n\nThis action cannot be undone.`)) return;
    setDeletingId(document.id);
    setError('');
    try {
      await deleteDocument(workspaceId, document.id);
      setFeedback('Document deleted.');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to delete document.');
    } finally {
      setDeletingId('');
    }
  };

  return (
    <section className="mt-12">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div className="flex items-center gap-3">
          <FolderOpen className="h-5 w-5 text-primary" />
          <div>
            <h2 className="text-lg font-semibold">Documents</h2>
            <p className="text-sm text-muted">
              {projectId ? 'Files attached to this project.' : 'Files shared across this workspace.'}
            </p>
          </div>
        </div>
        {canCreate && (
          <button
            onClick={() => {
              setFeedback('');
              setError('');
              setShowUpload(true);
            }}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover"
          >
            <Upload className="h-4 w-4" /> Upload document
          </button>
        )}
      </div>
      {feedback && <p className="mt-4 rounded-xl border border-success/30 bg-success/10 p-3 text-sm text-success">{feedback}</p>}
      {error && <p role="alert" className="mt-4 rounded-xl border border-error/30 bg-error/10 p-3 text-sm text-error">{error}</p>}
      {showUpload && (
        <UploadDocumentForm
          projects={projects}
          projectId={projectId}
          workspaceId={workspaceId}
          onClose={() => setShowUpload(false)}
          onSaved={async () => {
            setShowUpload(false);
            setFeedback('Document uploaded.');
            await load();
          }}
        />
      )}
      {loading ? (
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {[1, 2].map((item) => <div key={item} className="h-28 animate-pulse rounded-2xl border border-border bg-surface" />)}
        </div>
      ) : documents.length === 0 ? (
        <div className="mt-5 rounded-2xl border border-dashed border-border p-10 text-center">
          <FileText className="mx-auto h-8 w-8 text-muted" />
          <h3 className="mt-3 font-medium">No documents yet.</h3>
          <p className="mt-2 text-sm text-muted">Upload your first document to get started.</p>
        </div>
      ) : (
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {documents.map((document) => (
            <article key={document.id} className="rounded-2xl border border-border bg-surface p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
                  <FileText className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-medium" title={document.originalName}>{document.originalName}</h3>
                  <p className="mt-1 text-xs uppercase text-muted">{extension(document.originalName)} · {formatSize(document.size)}</p>
                </div>
                <div className="flex shrink-0 gap-2 text-muted">
                  <button aria-label={`Download ${document.originalName}`} disabled={downloadId === document.id} onClick={() => void download(document)} className="hover:text-foreground disabled:opacity-50">
                    {downloadId === document.id ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                  </button>
                  {canDelete && <button aria-label={`Delete ${document.originalName}`} disabled={deletingId === document.id} onClick={() => void remove(document)} className="hover:text-error disabled:opacity-50">
                    {deletingId === document.id ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  </button>}
                </div>
              </div>
              <p className="mt-4 text-xs text-muted">
                Uploaded by {document.uploadedBy.name} · {new Date(document.createdAt).toLocaleDateString()}
                {document.project ? ` · ${document.project.name}` : ''}
              </p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function UploadDocumentForm({
  workspaceId,
  projectId,
  projects,
  onClose,
  onSaved,
}: {
  workspaceId: string;
  projectId?: string;
  projects: ProjectOption[];
  onClose: () => void;
  onSaved: () => Promise<void>;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [selectedProject, setSelectedProject] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const selectFile = (next: File | undefined) => {
    if (!next) return;
    const suffix = next.name.slice(next.name.lastIndexOf('.')).toLowerCase();
    if (!allowedExtensions.includes(suffix)) return setError('Only PDF, DOC, DOCX, and TXT files are supported.');
    if (next.size > maxSize) return setError('Documents must be 10 MB or smaller.');
    if (next.size === 0) return setError('The selected document is empty.');
    setFile(next);
    setError('');
  };
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!file) return setError('Choose a document to upload.');
    setBusy(true);
    setError('');
    try {
      await uploadDocument(workspaceId, file, projectId ?? (selectedProject || undefined));
      await onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to upload document.');
    } finally {
      setBusy(false);
    }
  };
  return (
    <form onSubmit={submit} className="mt-5 rounded-2xl border border-border bg-surface p-5">
      <div className="flex items-center justify-between">
        <div><h3 className="font-semibold">Upload document</h3><p className="mt-1 text-xs text-muted">PDF, DOC, DOCX, or TXT · up to 10 MB</p></div>
        <button type="button" onClick={onClose} aria-label="Close upload"><X className="h-5 w-5 text-muted" /></button>
      </div>
      <label className="mt-5 flex cursor-pointer flex-col items-center rounded-xl border border-dashed border-border p-7 text-center hover:border-primary">
        <Upload className="h-6 w-6 text-primary" />
        <span className="mt-2 text-sm">{file ? file.name : 'Choose a document'}</span>
        <span className="mt-1 text-xs text-muted">Select a supported file from your device.</span>
        <input type="file" accept=".pdf,.doc,.docx,.txt" className="sr-only" onChange={(event) => selectFile(event.target.files?.[0])} />
      </label>
      {!projectId && projects.length > 0 && (
        <select value={selectedProject} onChange={(event) => setSelectedProject(event.target.value)} className="mt-4 w-full rounded-xl border border-border bg-surface-secondary px-4 py-3 text-sm outline-none focus:border-primary">
          <option value="">Workspace document</option>
          {projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}
        </select>
      )}
      {error && <p className="mt-3 flex items-center gap-2 text-sm text-error"><AlertCircle className="h-4 w-4" />{error}</p>}
      <div className="mt-5 flex justify-end gap-3">
        <button type="button" onClick={onClose} className="rounded-xl border border-border px-4 py-2 text-sm text-muted hover:text-foreground">Cancel</button>
        <button disabled={busy} className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold disabled:opacity-60">{busy ? 'Uploading...' : 'Upload document'}</button>
      </div>
    </form>
  );
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function extension(name: string) {
  return name.split('.').pop() ?? 'file';
}
