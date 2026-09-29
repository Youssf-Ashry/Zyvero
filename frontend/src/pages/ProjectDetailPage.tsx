import { ArrowLeft, BookOpen, CheckCircle2, ListTodo, Plus } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { useCallback, useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import AppShell from '../components/app/AppShell';
import { useAuth } from '../context/AuthContext';
import { apiRequest, getWorkspaceMembers, type WorkspaceMember } from '../services/api';
import TaskDetailsModal, { type TaskDetails } from '../components/app/TaskDetailsModal';

type Project = {
  id: string;
  name: string;
  description?: string;
  status: string;
  tasks: Task[];
  contents: Content[];
};
type Task = {
  id: string;
  title: string;
  description?: string | null;
  status: string;
  priority: string;
  assigneeId?: string | null;
  assignee?: { id: string; name: string; email: string } | null;
  createdAt?: string;
  updatedAt?: string;
};
type Content = { id: string; title: string; content: string; type: string };
export default function ProjectDetailPage() {
  const { id } = useParams();
  const { workspace, hasWorkspacePermission } = useAuth();
  const canCreateTask = hasWorkspacePermission('TASK_CREATE', workspace?.id);
  const canAssignTask = hasWorkspacePermission('TASK_ASSIGN', workspace?.id);
  const canUpdateTask = hasWorkspacePermission('TASK_UPDATE', workspace?.id);
  const [project, setProject] = useState<Project | null>(null);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskStatus, setTaskStatus] = useState('TODO');
  const [taskPriority, setTaskPriority] = useState('MEDIUM');
  const [taskAssigneeId, setTaskAssigneeId] = useState('');
  const [showTask, setShowTask] = useState(false);
  const [error, setError] = useState('');
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [selectedTask, setSelectedTask] = useState<TaskDetails | null>(null);
  const load = useCallback(
    () =>
      workspace &&
      id &&
      apiRequest<Project>(`/workspaces/${workspace.id}/projects/${id}`)
        .then(setProject)
        .catch(() => setError('Unable to load this project.')),
    [workspace, id],
  );
  useEffect(() => {
    void load();
  }, [load]);
  useEffect(() => {
    if (!workspace) return;
    getWorkspaceMembers(workspace.id).then((result) => setMembers(result.members)).catch(() => {
      setError('Unable to load workspace members.');
    });
  }, [workspace]);
  const createTask = async (event: FormEvent) => {
    event.preventDefault();
    if (!workspace || !id) return;
    try {
      await apiRequest(`/workspaces/${workspace.id}/projects/${id}/tasks`, {
        method: 'POST',
        body: {
          title: taskTitle,
          description: taskDescription || undefined,
          status: taskStatus,
          priority: taskPriority,
          assigneeId: taskAssigneeId || undefined,
        },
      });
      setTaskTitle('');
      setTaskDescription('');
      setTaskStatus('TODO');
      setTaskPriority('MEDIUM');
      setTaskAssigneeId('');
      setShowTask(false);
      await load();
    } catch {
      setError('Unable to create task.');
    }
  };
  return (
    <AppShell>
      <Link
        to="/projects"
        className="inline-flex items-center gap-2 text-sm text-muted hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> All projects
      </Link>
      {error && (
        <p className="mt-5 rounded-xl border border-error/30 bg-error/10 p-4 text-sm text-error">
          {error}
        </p>
      )}
      {project && (
        <>
          <div className="mt-7 flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
            <div>
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs text-primary">
                {project.status}
              </span>
              <h1 className="mt-4 text-3xl font-semibold">{project.name}</h1>
              <p className="mt-2 max-w-2xl text-muted">
                {project.description || 'No project description yet.'}
              </p>
            </div>
            <Link
              to={`/projects/${id}/content`}
              className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm hover:border-primary"
            >
              <BookOpen className="h-4 w-4" /> Knowledge
            </Link>
          </div>
          <div className="mt-10 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
            <section className="rounded-2xl border border-border bg-surface p-5">
              <div className="flex items-center justify-between">
                <h2 className="flex items-center gap-2 font-semibold">
                  <ListTodo className="h-4 w-4 text-primary" /> Tasks
                </h2>
                {canCreateTask && <button
                  onClick={() => setShowTask((v) => !v)}
                  className="inline-flex items-center gap-1 text-sm text-primary"
                >
                  <Plus className="h-4 w-4" /> Add
                </button>}
              </div>
              {showTask && canCreateTask && (
                <form onSubmit={createTask} className="mt-4 space-y-3">
                  <input
                    required
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    placeholder="Task title"
                    className="w-full rounded-xl border border-border bg-surface-secondary px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                  <textarea
                    rows={3}
                    value={taskDescription}
                    onChange={(e) => setTaskDescription(e.target.value)}
                    placeholder="Description (optional)"
                    className="w-full resize-y rounded-xl border border-border bg-surface-secondary px-3 py-2 text-sm outline-none focus:border-primary"
                  />
                  <div className="grid gap-3 sm:grid-cols-3">
                    <select
                      value={taskStatus}
                      onChange={(e) => setTaskStatus(e.target.value)}
                      className="rounded-xl border border-border bg-surface-secondary px-3 py-2 text-sm outline-none focus:border-primary"
                    >
                      {['TODO', 'IN_PROGRESS', 'DONE', 'CANCELED'].map((value) => (
                        <option key={value} value={value}>{value.replace('_', ' ')}</option>
                      ))}
                    </select>
                    <select
                      value={taskPriority}
                      onChange={(e) => setTaskPriority(e.target.value)}
                      className="rounded-xl border border-border bg-surface-secondary px-3 py-2 text-sm outline-none focus:border-primary"
                    >
                      {['LOW', 'MEDIUM', 'HIGH', 'URGENT'].map((value) => (
                        <option key={value} value={value}>{value}</option>
                      ))}
                    </select>
                    {canAssignTask && (
                      <select
                        value={taskAssigneeId}
                        onChange={(e) => setTaskAssigneeId(e.target.value)}
                        className="rounded-xl border border-border bg-surface-secondary px-3 py-2 text-sm outline-none focus:border-primary"
                      >
                        <option value="">Unassigned</option>
                        {members.map((member) => (
                          <option key={member.id} value={member.id}>{member.name}</option>
                        ))}
                      </select>
                    )}
                  </div>
                  <button className="rounded-xl bg-primary px-3 py-2 text-sm font-semibold text-white">Add task</button>
                </form>
              )}
              <div className="mt-5 space-y-2">
                {project.tasks.length === 0 ? (
                  <p className="text-sm text-muted">No tasks yet.</p>
                ) : (
                  project.tasks.map((task) => (
                    <button
                      key={task.id}
                      onClick={() => setSelectedTask({
                        ...task,
                        projectId: id ?? '',
                        projectName: project.name,
                        assignee: task.assignee ?? members.find((member) => member.id === task.assigneeId),
                      })}
                      className="flex w-full items-center gap-3 rounded-xl bg-surface-secondary px-3 py-3 text-left text-sm hover:bg-border"
                    >
                      <CheckCircle2
                        className={`h-4 w-4 ${task.status === 'DONE' ? 'text-success' : 'text-muted'}`}
                      />
                      <span className={task.status === 'DONE' ? 'text-muted line-through' : ''}>
                        {task.title}
                      </span>
                      <span className="ml-auto text-xs text-muted">{task.priority}</span>
                    </button>
                  ))
                )}
              </div>
            </section>
            <section className="rounded-2xl border border-border bg-surface p-5">
              <div className="flex items-center justify-between">
                <h2 className="flex items-center gap-2 font-semibold">
                  <BookOpen className="h-4 w-4 text-primary" /> Knowledge
                </h2>
                <Link to={`/projects/${id}/content`} className="text-sm text-primary">
                  Manage
                </Link>
              </div>
              <div className="mt-5 space-y-3">
                {project.contents.length === 0 ? (
                  <p className="text-sm text-muted">No knowledge items yet.</p>
                ) : (
                  project.contents.slice(0, 4).map((item) => (
                    <div key={item.id} className="rounded-xl bg-surface-secondary p-3">
                      <p className="text-sm font-medium">{item.title}</p>
                      <p className="mt-1 text-xs text-muted">{item.type}</p>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>
        </>
      )}
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
            void load();
          }}
        />
      )}
    </AppShell>
  );
}
