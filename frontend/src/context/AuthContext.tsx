import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { apiRequest } from '../services/api';

export type User = { id: string; name: string; email: string; createdAt: string };
export type Workspace = {
  id: string;
  name: string;
  slug: string;
  _count?: { projects: number; members: number };
};

type AuthContextValue = {
  user: User | null;
  workspace: Workspace | null;
  workspaces: Workspace[];
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshWorkspaces: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshWorkspaces = useCallback(async () => {
    const result = await apiRequest<Workspace[]>('/workspaces');
    setWorkspaces(result);
  }, []);

  useEffect(() => {
    apiRequest<User>('/auth/me')
      .then(async (currentUser) => {
        setUser(currentUser);
        await refreshWorkspaces();
      })
      .catch(() => {
        localStorage.removeItem('zyvero_access_token');
      })
      .finally(() => setLoading(false));
  }, [refreshWorkspaces]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      const result = await apiRequest<{ user: User; token: string }>('/auth/login', {
        method: 'POST',
        body: { email, password },
      });
      localStorage.setItem('zyvero_access_token', result.token);
      setUser(result.user);
      await refreshWorkspaces();
    },
    [refreshWorkspaces],
  );

  const signUp = useCallback(async (name: string, email: string, password: string) => {
    const result = await apiRequest<{ user: User; token: string; workspace: Workspace }>(
      '/auth/signup',
      {
        method: 'POST',
        body: { name, email, password },
      },
    );
    localStorage.setItem('zyvero_access_token', result.token);
    setUser(result.user);
    setWorkspaces([result.workspace]);
  }, []);

  const signOut = useCallback(async () => {
    await apiRequest<void>('/auth/logout', { method: 'POST' });
    localStorage.removeItem('zyvero_access_token');
    setUser(null);
    setWorkspaces([]);
  }, []);

  const value = useMemo(
    () => ({
      user,
      workspace: workspaces[0] ?? null,
      workspaces,
      loading,
      signIn,
      signUp,
      signOut,
      refreshWorkspaces,
    }),
    [user, workspaces, loading, signIn, signUp, signOut, refreshWorkspaces],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used inside AuthProvider');
  return value;
}
