import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createServerClient } from '@supabase/ssr';
import Sidebar from '@/components/Sidebar';
import StatusBar from '@/components/StatusBar';

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set() {},
        remove() {},
      },
    }
  );

  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    redirect('/auth/login');
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 ml-0 md:ml-64 p-5 md:p-8 pb-14 min-h-screen">
        {children}
      </main>
      <StatusBar />
    </div>
  );
}
