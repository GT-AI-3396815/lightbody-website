import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  try {
    const { phone, password, invite_code } = await request.json();

    // 校验手机号
    if (!phone || !/^1\d{10}$/.test(phone)) {
      return NextResponse.json({ error: '手机号格式错误' }, { status: 400 });
    }

    // 校验密码
    if (!password || password.length < 6) {
      return NextResponse.json({ error: '密码至少6位' }, { status: 400 });
    }

    // 邀请码必填
    if (!invite_code || !invite_code.trim()) {
      return NextResponse.json({ error: '请输入邀请码' }, { status: 400 });
    }

    const trimmedCode = invite_code.trim();
    const isUniversalCode = trimmedCode === 'gts3396815';
    let needBindInvite = false;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // 非通用邀请码走数据库验证
    if (!isUniversalCode) {
      const { data: invite } = await supabase
        .from('invite_codes')
        .select('id, is_used')
        .eq('code', trimmedCode)
        .single();

      if (!invite) {
        return NextResponse.json({ error: '邀请码无效' }, { status: 400 });
      }
      if (invite.is_used) {
        return NextResponse.json({ error: '邀请码已被使用' }, { status: 400 });
      }
      needBindInvite = true;
    }

    // 手机号转 E.164 格式
    const e164Phone = phone.trim().startsWith('+') ? phone.trim() : `+86${phone.trim()}`;

    // 生成虚拟邮箱，走 email 注册通道（绕过 phone provider 未启用问题）
    const virtualEmail = `${e164Phone.replace('+', '')}@phone.local`;

    // 直接调用 Supabase Auth Admin REST API（绕过 SDK 路径拼装问题）
    const res = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${serviceRoleKey}`,
        'apikey': serviceRoleKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: virtualEmail,
        password,
        email_confirm: true,
        phone: e164Phone,
        user_metadata: { phone: e164Phone },
      }),
    });

    const result = await res.json();

    if (!res.ok) {
      const errMsg = result.msg || result.message || JSON.stringify(result);
      if (errMsg.toLowerCase().includes('already')) {
        return NextResponse.json({ error: '该手机号已注册' }, { status: 409 });
      }
      console.error('Create user error:', result);
      return NextResponse.json({ error: `注册失败: ${errMsg}` }, { status: 500 });
    }

    // 仅非通用邀请码需要绑定
    if (needBindInvite) {
      await supabase
        .from('invite_codes')
        .update({ is_used: true, used_by: phone.trim() })
        .eq('code', trimmedCode)
        .eq('is_used', false);
    }

    return NextResponse.json({
      success: true,
      user_id: result.id,
    });
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}
