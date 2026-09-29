import { useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import AppShell from '../components/app/AppShell';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../services/api';
import TaskDetailsModal, { type TaskDetails } from '../components/app/TaskDetailsModal';

type Task = {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  project: { id: string; name: string };
  assignee?: { id: string; name: string; email: string } | null;
};
type Project = { id: string; name: string };
type Member = { id: string; name: string; email: string; role: 'OWNER' | 'ADMIN' | 'MEMBER' };

export default function TasksPage() {
  const { workspace } = useAuth();
  const { hasWorkspacePermission } = useAuth();
  const [params, setParams] = useSearchParams();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTask, setSelectedTask] = useState<TaskDetails | null>(null);
  const canAssignTask = hasWorkspacePermission('TASK_ASSIGN', workspace?.id);
  const canUpdateTask = hasWorkspacePermission('TASK_UPDATE', workspace?.id);
  const search = params.get('search') ?? '';
  const status = params.get('status') ?? '';
  const priority = params.get('priority') ?? '';
  const assigneeId = params.get('assigneeId') ?? '';
  const projectId = params.get('projectId') ?? '';

  useEffect(() => {
    if (!workspace) return;
    Promise.all([
      apiRequest<Project[]>(`/workspaces/${workspace.id}/projects`),
      apiRequest<{ members: Member[] }>(`/workspaces/${workspace.id}`),
    ])
      .then(([projectResult, workspaceResult]) => {
        setProjects(projectResult);
        setMembers(workspaceResult.members);
      })
      .catch(() => setError('Unable to load task filters.'));
  }, [workspace]);

  useEffect(() => {
    if (!workspace) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    const query = params.toString();
    apiRequest<Task[]>(`/workspaces/${workspace.id}/tasks${query ? `?${query}` : ''}`)
      .then(setTasks)
      .catch((err) => setError(err instanceof Error ? err.message : 'Unable to load tasks.'))
      .finally(() => setLoading(false));
  }, [workspace, params]);

  const setFilter = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next);
  };

  return (
    <AppShell>
      <div className="space-y-8">
        <header>
          <p className="text-xs uppercase tracking-[0.2em] text-primary">Execution</p>
          <h1 className="mt-3 text-3xl font-semibold text-white">Tasks</h1>
          <p className="mt-2 text-muted">Search and filter tasks across your workspace.</p>
        </header>
        <div className="grid gap-3 rounded-2xl border border-border bg-surface p-5 md:grid-cols-2 lg:grid-cols-5">
          <input
            value={search}
            onChange={(event) => setFilter('search', event.target.value)}
            placeholder="Search tasks..."
            className="rounded-xl border border-border bg-surface-secondary p-3 text-sm text-foreground outline-none focus:border-primary lg:col-span-2"
          />
          <select
            value={status}
            onChange={(event) => setFilter('status', event.target.value)}
            className="rounded-xl border border-border bg-surface-secondary p-3 text-sm text-foreground outline-none focus:border-primary"
          >
            <option value="">All statuses</option>
            {['TODO', 'IN_PROGRESS', 'DONE', 'CANCELED'].map((value) => (
              <option key={value} value={value}>
                {value.replace('_', ' ')}
              </option>
            ))}
          </select>
          <select
            value={priority}
            onChange={(event) => setFilter('priority', event.target.value)}
            className="rounded-xl border border-border bg-surface-secondary p-3 text-sm text-foreground outline-none focus:border-primary"
          >
            <option value="">All priorities</option>
            {['LOW', 'MEDIUM', 'HIGH', 'URGENT'].map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
          <select
            value={projectId}
            onChange={(event) => setFilter('projectId', event.target.value)}
            className="rounded-xl border border-border bg-surface-secondary p-3 text-sm text-foreground outline-none focus:border-primary"
          >
            <option value="">All projects</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
          <select
            value={assigneeId}
            onChange={(event) => setFilter('assigneeId', event.target.value)}
            className="rounded-xl border border-border bg-surface-secondary p-3 text-sm text-foreground outline-none focus:border-primary"
          >
            <option value="">All assignees</option>
            {members.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name}
              </option>
            ))}
          </select>
          <button
            onClick={() => setParams({})}
            className="w-fit rounded-xl border border-border px-4 py-3 text-sm text-muted hover:border-primary hover:text-white"
          >
            Clear filters
          </button>
        </div>
        <div className="text-sm text-muted">
          {tasks.length} result{tasks.length === 1 ? '' : 's'}
        </div>
        {error && (
          <p className="rounded-xl border border-error/40 bg-error/10 p-4 text-sm text-error">
            {error}
          </p>
        )}
        <section className="overflow-hidden rounded-2xl border border-border bg-surface">
          {loading ? (
            <p className="p-5 text-sm text-muted">Loading tasks...</p>
          ) : tasks.length === 0 ? (
            <p className="p-5 text-sm text-muted">
              No tasks found. Try changing your search or filters.
            </p>
          ) : (
            <div className="divide-y divide-border">
              {tasks.map((task) => (
                <button
                  key={task.id}
                  onClick={() => setSelectedTask({
                    ...task,
                    projectId: task.project.id,
                    projectName: task.project.name,
                  })}
                  className="block w-full p-5 text-left hover:bg-surface-secondary"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h2 className="font-medium text-white">{task.title}</h2>
                      <p className="mt-1 text-sm text-muted">
                        {task.project.name} · {task.assignee?.name ?? 'Unassigned'}
                      </p>
                    </div>
                    <div className="flex gap-2 text-xs">
                      <span className="rounded-full bg-primary/10 px-2.5 py-1 text-primary">
                        {task.status.replace('_', ' ')}
                      </span>
                      <span className="rounded-full bg-surface-secondary px-2.5 py-1 text-muted">
                        {task.priority}
                      </span>
                    </div>
                  </div>
                  {task.description && (
                    <p className="mt-3 text-sm text-muted">{task.description.slice(0, 180)}</p>
                  )}
                </button>
              ))}
            </div>
          )}
        </section>
        {selectedTask && workspace && (
          <TaskDetailsModal
            workspaceId={workspace.id}
            task={selectedTask}
            members={members}
            canAssign={canAssignTask}
            canUpdate={canUpdateTask}
            onClose={() => setSelectedTask(null)}
            onSaved={(updatedTask) => {
              setSelectedTask(updatedTask);
              setTasks((current) =>
                current.map((item) =>
                  item.id === updatedTask.id
                    ? {
                        ...item,
                        title: updatedTask.title,
                        description: updatedTask.description ?? undefined,
                        status: updatedTask.status,
                        priority: updatedTask.priority,
                        assignee: updatedTask.assignee ?? null,
                      }
                    : item,
                ),
              );
            }}
          />
        )}
      </div>
    </AppShell>
  );
}
