import { NextResponse } from 'next/server';
import { createServiceRoleSupabase } from '@/lib/supabase-server';

/**
 * POST /api/auth/bind-phone
 * 微信扫码后绑定手机号 + 密码 + 邀请码，完成注册
 */
export async function POST(request: Request) {
  try {
    const { token, phone, password, invite_code } = await request.json();

    // 参数校验
    if (!token) {
      return NextResponse.json({ error: '缺少 token' }, { status: 400 });
    }
    if (!phone || !/^1\d{10}$/.test(phone)) {
      return NextResponse.json({ error: '手机号格式错误' }, { status: 400 });
    }
    if (!password || password.length < 6) {
      return NextResponse.json({ error: '密码至少 6 位' }, { status: 400 });
    }

    const supabase = createServiceRoleSupabase();

    // 1. 验证临时 token
    const { data: authRecord, error: findError } = await supabase
      .from('wechat_auth_tokens')
      .select('*')
      .eq('token', token)
      .eq('status', 'bind_phone')
      .eq('used', false)
      .single();

    if (findError || !authRecord) {
      return NextResponse.json({ error: '无效的认证令牌' }, { status: 400 });
    }

    if (new Date(authRecord.expires_at) < new Date()) {
      return NextResponse.json({ error: '认证令牌已过期，请重新扫码' }, { status: 400 });
    }

    // 2. 如果提供了邀请码，验证
    if (invite_code) {
      const { data: invite } = await supabase
        .from('invite_codes')
        .select('id, is_used')
        .eq('code', invite_code.trim())
        .single();

      if (!invite) {
        return NextResponse.json({ error: '邀请码无效' }, { status: 400 });
      }
      if (invite.is_used) {
        return NextResponse.json({ error: '邀请码已被使用' }, { status: 400 });
      }
    }

    // 3. 通过 Supabase admin API 创建用户
    const { data: { user }, error: createError } = await supabase.auth.admin.createUser({
      phone,
      phone_confirm: true,
      password,
    });

    if (createError) {
      // 手机号已被注册
      if (createError.message?.includes('already') || createError.message?.includes('duplicate')) {
        return NextResponse.json({ error: '该手机号已被注册' }, { status: 409 });
      }
      console.error('Create user error:', createError);
      return NextResponse.json({ error: '用户创建失败' }, { status: 500 });
    }

    if (!user) {
      return NextResponse.json({ error: '用户创建失败' }, { status: 500 });
    }

    // 4. 在 profiles 表记录微信绑定
    await supabase
      .from('profiles')
      .update({
        wechat_openid: authRecord.openid,
        wechat_unionid: authRecord.unionid || null,
      })
      .eq('id', user.id);

    // 5. 标记 token 已使用
    await supabase
      .from('wechat_auth_tokens')
      .update({ used: true })
      .eq('token', token);

    // 6. 绑定邀请码
    if (invite_code) {
      await supabase
        .from('invite_codes')
        .update({ is_used: true, used_by: phone })
        .eq('code', invite_code.trim())
        .eq('is_used', false);
    }

    return NextResponse.json({
      success: true,
      phone,
      user_id: user.id,
    });
  } catch (error) {
    console.error('Bind phone error:', error);
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}
