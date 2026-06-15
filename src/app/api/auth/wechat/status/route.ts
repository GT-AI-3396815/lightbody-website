import { NextResponse } from 'next/server';
import { createServiceRoleSupabase } from '@/lib/supabase-server';

/**
 * GET /api/auth/wechat/status?state=xxx
 * 轮询检查微信扫码登录状态
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const state = searchParams.get('state');

    if (!state) {
      return NextResponse.json({ error: '缺少 state 参数' }, { status: 400 });
    }

    const supabase = createServiceRoleSupabase();

    // 从 wechat_auth_tokens 表查询是否有对应 state 的已处理记录
    // 注意：这里的 state 是我们在生成授权 URL 时创建的
    const { data: tokens } = await supabase
      .from('wechat_auth_tokens')
      .select('token, status, used')
      .eq('state', state)
      .order('created_at', { ascending: false })
      .limit(1);

    if (!tokens || tokens.length === 0) {
      return NextResponse.json({ status: 'pending' });
    }

    const record = tokens[0];

    if (record.status === 'login' || record.status === 'bind_phone') {
      return NextResponse.json({
        status: record.status,
        token: record.token,
      });
    }

    return NextResponse.json({ status: 'pending' });
  } catch (error) {
    console.error('WeChat status error:', error);
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}
