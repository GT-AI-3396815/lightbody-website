import { NextResponse } from 'next/server';
import { createServiceRoleSupabase } from '@/lib/supabase-server';
import { createServerSupabase } from '@/lib/supabase-server';
import crypto from 'crypto';

/**
 * GET /api/auth/wechat/login?token=xxx&redirect=/
 * 用临时 token 验证后，通过服务器端 Supabase 签名登录，重定向到首页
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    const redirectTo = searchParams.get('redirect') || '/';

    if (!token) {
      return NextResponse.redirect(new URL('/auth/login?error=missing_token', request.url));
    }

    const supabase = createServiceRoleSupabase();

    // 1. 验证临时 token
    const { data: authRecord, error: findError } = await supabase
      .from('wechat_auth_tokens')
      .select('*')
      .eq('token', token)
      .eq('status', 'login')
      .eq('used', false)
      .single();

    if (findError || !authRecord) {
      return NextResponse.redirect(new URL('/auth/login?error=invalid_token', request.url));
    }

    if (new Date(authRecord.expires_at) < new Date()) {
      return NextResponse.redirect(new URL('/auth/login?error=token_expired', request.url));
    }

    // 2. 根据 openid 找到用户
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, wechat_openid')
      .eq('wechat_openid', authRecord.openid)
      .single();

    if (!profile) {
      return NextResponse.redirect(new URL('/auth/login?error=user_not_found', request.url));
    }

    // 3. 获取用户的 phone 用于登录
    const { data: { user: authUser } } = await supabase.auth.admin.getUserById(profile.id);

    if (!authUser || !authUser.phone) {
      return NextResponse.redirect(new URL('/auth/login?error=user_no_phone', request.url));
    }

    // 4. 生成临时密码并更新用户
    const tempPassword = crypto.randomBytes(16).toString('hex');
    await supabase.auth.admin.updateUserById(profile.id, { password: tempPassword });

    // 5. 标记 token 已使用
    await supabase
      .from('wechat_auth_tokens')
      .update({ used: true })
      .eq('token', token);

    // 6. 用服务器端 Supabase 客户端签名登录（会设置 auth cookie）
    const serverClient = createServerSupabase();
    const { error: signInError } = await serverClient.auth.signInWithPassword({
      phone: authUser.phone,
      password: tempPassword,
    });

    if (signInError) {
      console.error('WeChat sign-in error:', signInError);
      return NextResponse.redirect(new URL('/auth/login?error=sign_in_failed', request.url));
    }

    // 7. 重定向到首页
    return NextResponse.redirect(new URL(redirectTo, request.url));
  } catch (error) {
    console.error('WeChat login error:', error);
    return NextResponse.redirect(new URL('/auth/login?error=server_error', request.url));
  }
}
