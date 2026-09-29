import { UserPlus, Users, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import AppShell from '../components/app/AppShell';
import { useAuth } from '../context/AuthContext';
import {
  addWorkspaceMember,
  getWorkspaceMembers,
  removeWorkspaceMember,
  type WorkspaceMember,
  updateWorkspaceMemberRole,
} from '../services/api';

export default function WorkspaceMembersPage() {
  const { user, workspace, hasWorkspacePermission } = useAuth();
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'ADMIN' | 'MEMBER'>('MEMBER');
  const [adding, setAdding] = useState(false);
  const [savingId, setSavingId] = useState('');
  const [removingId, setRemovingId] = useState('');

  const canView = hasWorkspacePermission('MEMBER_VIEW', workspace?.id);
  const canInvite = hasWorkspacePermission('MEMBER_INVITE', workspace?.id);
  const canUpdateRole = hasWorkspacePermission('MEMBER_UPDATE_ROLE', workspace?.id);
  const canRemove = hasWorkspacePermission('MEMBER_REMOVE', workspace?.id);

  const load = useCallback(async () => {
    if (!workspace || !canView) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const result = await getWorkspaceMembers(workspace.id);
      setMembers(result.members);
    } catch {
      setError('Unable to load workspace members.');
    } finally {
      setLoading(false);
    }
  }, [workspace, canView]);

  useEffect(() => {
    // Load members when the authenticated workspace changes.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  const addMember = async (event: FormEvent) => {
    event.preventDefault();
    if (!workspace) return;
    setAdding(true);
    setError('');
    setFeedback('');
    try {
      await addWorkspaceMember(workspace.id, { email, role });
      setEmail('');
      setRole('MEMBER');
      setShowAdd(false);
      setFeedback('Member added successfully.');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to add workspace member.');
    } finally {
      setAdding(false);
    }
  };

  const changeRole = async (member: WorkspaceMember, nextRole: 'ADMIN' | 'MEMBER') => {
    if (!workspace || member.role === 'OWNER' || nextRole === member.role) return;
    setSavingId(member.id);
    setError('');
    setFeedback('');
    try {
      await updateWorkspaceMemberRole(workspace.id, member.id, nextRole);
      setFeedback(`${member.name}'s role was updated.`);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update member role.');
    } finally {
      setSavingId('');
    }
  };

  const removeMember = async (member: WorkspaceMember) => {
    if (!workspace || member.role === 'OWNER') return;
    if (!window.confirm(`Remove ${member.email} from this workspace?`)) return;
    setRemovingId(member.id);
    setError('');
    setFeedback('');
    try {
      await removeWorkspaceMember(workspace.id, member.id);
      setFeedback(`${member.name} was removed from the workspace.`);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to remove workspace member.');
    } finally {
      setRemovingId('');
    }
  };

  return (
    <AppShell>
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm text-primary">Workspace access</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Members</h1>
          <p className="mt-2 max-w-2xl text-muted">Manage people and roles in this workspace.</p>
        </div>
        {canInvite && (
          <button
            onClick={() => {
              setShowAdd(true);
              setError('');
            }}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover"
          >
            <UserPlus className="h-4 w-4" /> Add member
          </button>
        )}
      </div>

      {showAdd && (
        <form onSubmit={addMember} className="mt-6 rounded-2xl border border-border bg-surface p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Add existing Zyvero user</h2>
            <button type="button" onClick={() => setShowAdd(false)} aria-label="Close add member form">
              <X className="h-5 w-5 text-muted" />
            </button>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_180px_auto]">
            <input
              required
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Email address"
              className="rounded-xl border border-border bg-surface-secondary px-4 py-3 text-sm outline-none focus:border-primary"
            />
            <select
              value={role}
              onChange={(event) => setRole(event.target.value as 'ADMIN' | 'MEMBER')}
              className="rounded-xl border border-border bg-surface-secondary px-4 py-3 text-sm outline-none focus:border-primary"
            >
              <option value="MEMBER">MEMBER</option>
              <option value="ADMIN">ADMIN</option>
            </select>
            <button
              disabled={adding}
              className="rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
            >
              {adding ? 'Adding...' : 'Add member'}
            </button>
          </div>
        </form>
      )}

      {feedback && <p role="status" className="mt-6 rounded-xl border border-success/30 bg-success/10 p-4 text-sm text-success">{feedback}</p>}
      {error && <p role="alert" className="mt-6 rounded-xl border border-error/30 bg-error/10 p-4 text-sm text-error">{error}</p>}

      {!canView ? (
        <div className="mt-8 rounded-2xl border border-error/30 bg-error/10 p-6 text-sm text-error">
          You do not have permission to view workspace members.
        </div>
      ) : loading ? (
        <p className="mt-8 text-sm text-muted">Loading workspace members...</p>
      ) : members.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-border p-12 text-center">
          <Users className="mx-auto h-8 w-8 text-muted" />
          <p className="mt-3 text-sm text-muted">No members found.</p>
        </div>
      ) : (
        <section className="mt-8 space-y-3">
          {members.map((member) => {
            const isCurrentUser = member.id === user?.id;
            const isOwner = member.role === 'OWNER';
            return (
              <article key={member.id} className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-5 sm:flex-row sm:items-center">
                <div className="flex min-w-0 flex-1 items-center gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary">
                    {member.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-medium">
                      {member.name} {isCurrentUser && <span className="text-xs text-primary">(You)</span>}
                    </p>
                    <p className="truncate text-sm text-muted">{member.email}</p>
                  </div>
                </div>
                <span className="text-xs font-semibold tracking-wide text-primary">{member.role}</span>
                <div className="flex items-center gap-3">
                  {canUpdateRole && !isOwner ? (
                    <select
                      aria-label={`Role for ${member.name}`}
                      value={member.role}
                      disabled={savingId === member.id}
                      onChange={(event) => void changeRole(member, event.target.value as 'ADMIN' | 'MEMBER')}
                      className="rounded-lg border border-border bg-surface-secondary px-3 py-2 text-xs outline-none focus:border-primary disabled:opacity-60"
                    >
                      <option value="MEMBER">MEMBER</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  ) : null}
                  {canRemove && !isOwner ? (
                    <button
                      disabled={removingId === member.id}
                      onClick={() => void removeMember(member)}
                      className="rounded-lg border border-error/30 px-3 py-2 text-xs text-error hover:bg-error/10 disabled:opacity-60"
                    >
                      {removingId === member.id ? 'Removing...' : 'Remove'}
                    </button>
                  ) : null}
                </div>
              </article>
            );
          })}
        </section>
      )}
    </AppShell>
  );
}
