import AuthGuard from '@/components/AuthGuard';
import Sidebar from '@/components/Sidebar';
import StatusBar from '@/components/StatusBar';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 ml-0 md:ml-64 p-5 md:p-8 pb-14 min-h-screen">
          {children}
        </main>
        <StatusBar />
      </div>
    </AuthGuard>
  );
}
