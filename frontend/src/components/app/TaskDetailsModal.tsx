import { X } from 'lucide-react';
import { useState } from 'react';
import type { WorkspaceMember } from '../../services/api';
import { apiRequest } from '../../services/api';

export type TaskDetails = {
  id: string;
  title: string;
  description?: string | null;
  status: string;
  priority: string;
  projectId: string;
  projectName: string;
  assignee?: { id: string; name: string; email: string } | null;
  createdAt?: string;
  updatedAt?: string;
};

type TaskDetailsModalProps = {
  workspaceId: string;
  task: TaskDetails;
  members: WorkspaceMember[];
  canAssign: boolean;
  canUpdate: boolean;
  onClose: () => void;
  onSaved: (task: TaskDetails) => void;
};

const statuses = ['TODO', 'IN_PROGRESS', 'DONE', 'CANCELED'];
const priorities = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

export default function TaskDetailsModal({
  workspaceId,
  task,
  members,
  canAssign,
  canUpdate,
  onClose,
  onSaved,
}: TaskDetailsModalProps) {
  const [status, setStatus] = useState(task.status);
  const [priority, setPriority] = useState(task.priority);
  const [assigneeId, setAssigneeId] = useState(task.assignee?.id ?? '');
  const [description, setDescription] = useState(task.description ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const save = async (changes: {
    status?: string;
    priority?: string;
    assigneeId?: string | null;
    description?: string;
  }) => {
    if (!canUpdate && (changes.status !== undefined || changes.priority !== undefined)) return;
    setSaving(true);
    setError('');
    try {
      const updated = await apiRequest<TaskDetails>(
        `/workspaces/${workspaceId}/projects/${task.projectId}/tasks/${task.id}`,
        { method: 'PATCH', body: changes },
      );
      onSaved({
        ...task,
        ...updated,
        projectId: task.projectId,
        projectName: task.projectName,
        assignee: changes.assigneeId !== undefined
          ? members.find((member) => member.id === changes.assigneeId)?.id
            ? members.find((member) => member.id === changes.assigneeId)
            : null
          : task.assignee,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update task.');
      setStatus(task.status);
      setPriority(task.priority);
      setAssigneeId(task.assignee?.id ?? '');
      setDescription(task.description ?? '');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-border bg-surface p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-primary">Task details</p>
            <h2 className="mt-2 text-2xl font-semibold">{task.title}</h2>
            <p className="mt-1 text-sm text-muted">{task.projectName}</p>
          </div>
          <button onClick={onClose} aria-label="Close task details">
            <X className="h-5 w-5 text-muted" />
          </button>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className="text-sm">
            <span className="mb-2 block text-muted">Status</span>
            <select
              value={status}
              disabled={!canUpdate || saving}
              onChange={(event) => {
                const value = event.target.value;
                setStatus(value);
                void save({ status: value });
              }}
              className="w-full rounded-xl border border-border bg-surface-secondary px-3 py-2.5 outline-none focus:border-primary disabled:opacity-60"
            >
              {statuses.map((value) => <option key={value} value={value}>{value.replace('_', ' ')}</option>)}
            </select>
          </label>
          <label className="text-sm">
            <span className="mb-2 block text-muted">Priority</span>
            <select
              value={priority}
              disabled={!canUpdate || saving}
              onChange={(event) => {
                const value = event.target.value;
                setPriority(value);
                void save({ priority: value });
              }}
              className="w-full rounded-xl border border-border bg-surface-secondary px-3 py-2.5 outline-none focus:border-primary disabled:opacity-60"
            >
              {priorities.map((value) => <option key={value} value={value}>{value}</option>)}
            </select>
          </label>
          <label className="text-sm sm:col-span-2">
            <span className="mb-2 block text-muted">Assignee</span>
            {canAssign ? (
              <select
                value={assigneeId}
                disabled={saving}
                onChange={(event) => {
                  const value = event.target.value;
                  setAssigneeId(value);
                  void save({ assigneeId: value || null });
                }}
                className="w-full rounded-xl border border-border bg-surface-secondary px-3 py-2.5 outline-none focus:border-primary disabled:opacity-60"
              >
                <option value="">Unassigned</option>
                {members.map((member) => (
                  <option key={member.id} value={member.id}>{member.name}</option>
                ))}
              </select>
            ) : (
              <p className="rounded-xl border border-border bg-surface-secondary px-3 py-2.5 text-muted">
                {task.assignee?.name ?? 'Unassigned'}
              </p>
            )}
          </label>
        </div>

        <div className="mt-6">
          <p className="text-sm text-muted">Description</p>
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            readOnly={!canUpdate}
            rows={5}
            placeholder="No description."
            className="mt-2 w-full resize-y rounded-xl border border-border bg-surface-secondary p-4 text-sm leading-6 outline-none focus:border-primary read-only:opacity-75"
          />
        </div>
        {canUpdate && (
          <button
            disabled={saving || description === (task.description ?? '')}
            onClick={() => void save({ description })}
            className="mt-5 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        )}
        {error && <p role="alert" className="mt-4 rounded-xl border border-error/30 bg-error/10 p-3 text-sm text-error">{error}</p>}
        {saving && <p className="mt-4 text-sm text-muted">Saving...</p>}
      </div>
    </div>
  );
}
