import type { ReactNode } from 'react';

type AppLayoutProps = {
  children: ReactNode;
};

export default function AppLayout({ children }: AppLayoutProps) {
  return <div className="min-h-screen bg-slate-950 text-slate-100">{children}</div>;
}
