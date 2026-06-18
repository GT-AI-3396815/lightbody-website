import { Suspense } from 'react';
import Sidebar from '@/components/Sidebar';
import StatusBar from '@/components/StatusBar';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen relative z-10">
      <Suspense fallback={<div className="w-64 bg-surface-900 border-r border-border-subtle" />}>
        <Sidebar />
      </Suspense>
      <main className="main-content animate-fadeIn">
        {children}
      </main>
      <StatusBar />
    </div>
  );
}
