import { NextResponse } from 'next/server';
import { createServiceRoleSupabase } from '@/lib/supabase-server';
import { getWechatConfig } from '@/lib/env';
import crypto from 'crypto';

/**
 * GET /api/auth/wechat/callback
 * 微信 OAuth 回调地址
 * 微信重定向回来时带 ?code=XXX&state=YYY
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const stateParam = searchParams.get('state');

    if (!code) {
      return NextResponse.json({ error: '缺少授权 code' }, { status: 400 });
    }

    // 解析 state 中的 redirect 参数
    let redirectTo = '/';
    if (stateParam) {
      try {
        const parsed = JSON.parse(decodeURIComponent(stateParam));
        if (parsed.redirect) redirectTo = parsed.redirect;
      } catch {
        // state 解析失败，使用默认 redirect
      }
    }

    const { appId, appSecret } = getWechatConfig();

    // 1. 用 code 换 access_token + openid
    const tokenUrl =
      `https://api.weixin.qq.com/sns/oauth2/access_token` +
      `?appid=${appId}` +
      `&secret=${appSecret}` +
      `&code=${code}` +
      `&grant_type=authorization_code`;

    const tokenRes = await fetch(tokenUrl);
    const tokenData = await tokenRes.json();

    if (tokenData.errcode) {
      console.error('WeChat token error:', tokenData);
      return NextResponse.json({ error: `微信授权失败: ${tokenData.errmsg}` }, { status: 400 });
    }

    const { openid, unionid } = tokenData;

    if (!openid) {
      return NextResponse.json({ error: '获取 openid 失败' }, { status: 400 });
    }

    // 2. 生成临时 token
    const tempToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

    const supabase = createServiceRoleSupabase();

    // 3. 查找 profiles 表是否存在该 openid 的用户
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id, wechat_openid')
      .eq('wechat_openid', openid)
      .maybeSingle();

    if (existingProfile) {
      // 用户已存在 → 生成临时 token，跳转登录
      await supabase.from('wechat_auth_tokens').insert({
        token: tempToken,
        openid,
        unionid: unionid || null,
        state: stateParam,
        status: 'login',
        expires_at: expiresAt,
        used: false,
      });

      const loginUrl = new URL('/api/auth/wechat/login', request.url);
      loginUrl.searchParams.set('token', tempToken);
      loginUrl.searchParams.set('redirect', redirectTo);
      return NextResponse.redirect(loginUrl);
    }

    // 用户不存在 → 生成临时 token，跳转绑定手机号页面
    await supabase.from('wechat_auth_tokens').insert({
      token: tempToken,
      openid,
      unionid: unionid || null,
      state: stateParam,
      status: 'bind_phone',
      expires_at: expiresAt,
      used: false,
    });

    const bindUrl = new URL('/auth/bind-phone', request.url);
    bindUrl.searchParams.set('token', tempToken);
    return NextResponse.redirect(bindUrl);
  } catch (error) {
    console.error('WeChat callback error:', error);
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}
