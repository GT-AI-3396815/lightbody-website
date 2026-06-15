'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [verified, setVerified] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    let cancelled = false;
    supabase.auth.getUser().then(({ data }) => {
      if (cancelled) return;
      if (!data.user) {
        router.replace('/auth/login');
      } else {
        setVerified(true);
      }
    });
    return () => { cancelled = true; };
  }, [pathname]);

  if (!verified) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-zinc-500 text-sm animate-pulse">验证身份中...</div>
      </div>
    );
  }

  return <>{children}</>;
}
