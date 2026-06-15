import { createServerSupabase } from '@/lib/supabase-edge';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 登录页、绑定手机号页和认证 API 允许匿名访问
  if (
    pathname.startsWith('/auth/login') ||
    pathname.startsWith('/auth/bind-phone') ||
    pathname.startsWith('/api/auth/')
  ) {
    return NextResponse.next();
  }

  const supabase = createServerSupabase();
  const { data: { session } } = await supabase.auth.getSession();

  // 未登录，重定向到登录页
  if (!session) {
    const loginUrl = new URL('/auth/login', request.url);
    if (pathname !== '/') {
      loginUrl.searchParams.set('redirect', pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  // 管理员路由检查
  if (pathname.startsWith('/admin')) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * 匹配所有路径，排除：
     * - _next/static (静态文件)
     * - _next/image (图片优化)
     * - favicon.ico (网站图标)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
