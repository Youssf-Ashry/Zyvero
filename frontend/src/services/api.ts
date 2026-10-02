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

export async function apiDownload(path: string): Promise<Blob> {
  const token = localStorage.getItem('zyvero_access_token');
  const response = await fetch(`${apiBase}${path}`, {
    credentials: 'include',
    headers: token ? { Authorization: 'Bearer ' + token } : {},
  });
  if (!response.ok) {
    let message = 'Unable to download the document.';
    try {
      const data = (await response.json()) as { message?: string | string[] };
      if (Array.isArray(data.message)) message = data.message.join(', ');
      else if (data.message) message = data.message;
    } catch {
      // Keep a safe fallback when the API does not return JSON.
    }
    throw new Error(message);
  }
  return response.blob();
}

export type DocumentRecord = {
  id: string;
  originalName: string;
  mimeType: string;
  size: number;
  createdAt: string;
  updatedAt: string;
  uploadedBy: { id: string; name: string; email: string };
  project: { id: string; name: string } | null;
};

export function getDocuments(workspaceId: string, projectId?: string) {
  const query = projectId ? `?projectId=${encodeURIComponent(projectId)}` : '';
  return apiRequest<DocumentRecord[]>(`/workspaces/${workspaceId}/documents${query}`);
}

export function uploadDocument(workspaceId: string, file: File, projectId?: string) {
  const body = new FormData();
  body.append('file', file);
  if (projectId) body.append('projectId', projectId);
  return apiRequest<DocumentRecord>(`/workspaces/${workspaceId}/documents`, {
    method: 'POST',
    body,
  });
}

export function deleteDocument(workspaceId: string, documentId: string) {
  return apiRequest<void>(`/workspaces/${workspaceId}/documents/${documentId}`, {
    method: 'DELETE',
  });
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
