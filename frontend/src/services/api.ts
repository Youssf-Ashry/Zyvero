const apiBase = (import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api').replace(/\/$/, '');
export const apiOrigin = apiBase.endsWith('/api') ? apiBase.slice(0, -4) : apiBase;

export type ApiRequestOptions = Omit<RequestInit, 'body'> & { body?: unknown };

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const token = localStorage.getItem('zyvero_access_token');
  const isFormData = options.body instanceof FormData;
  const response = await fetch(`${apiBase}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { Authorization: 'Bearer ' + token } : {}),
      ...(options.headers ?? {}),
    },
    body:
      options.body === undefined || isFormData
        ? (options.body as BodyInit | undefined)
        : JSON.stringify(options.body),
  });

  if (!response.ok) {
    let message = 'Something went wrong. Please try again.';
    try {
      const data = (await response.json()) as { message?: string | string[] };
      if (Array.isArray(data.message)) message = data.message.join(', ');
      else if (data.message) message = data.message;
    } catch {
      // Keep a user-safe fallback when the API does not return JSON.
    }
    throw new Error(message);
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

export function assetUrl(path: string | null) {
  if (!path) return null;
  return path.startsWith('http') ? path : `${apiOrigin}${path}`;
}

export type WorkspaceMember = {
  id: string;
  name: string;
  email: string;
  role: 'OWNER' | 'ADMIN' | 'MEMBER';
};

export function getWorkspaceMembers(workspaceId: string) {
  return apiRequest<{ members: WorkspaceMember[] }>(`/workspaces/${workspaceId}`);
}

export function addWorkspaceMember(
  workspaceId: string,
  data: { email: string; role: 'ADMIN' | 'MEMBER' },
) {
  return apiRequest<WorkspaceMember>(`/workspaces/${workspaceId}/members`, {
    method: 'POST',
    body: data,
  });
}

export function updateWorkspaceMemberRole(
  workspaceId: string,
  memberId: string,
  role: 'ADMIN' | 'MEMBER',
) {
  return apiRequest<WorkspaceMember>(`/workspaces/${workspaceId}/members/${memberId}`, {
    method: 'PATCH',
    body: { role },
  });
}

export function removeWorkspaceMember(workspaceId: string, memberId: string) {
  return apiRequest<void>(`/workspaces/${workspaceId}/members/${memberId}`, {
    method: 'DELETE',
  });
}
