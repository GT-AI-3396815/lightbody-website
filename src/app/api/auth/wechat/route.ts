import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { getWechatConfig } from '@/lib/env';

/**
 * GET /api/auth/wechat
 * 返回微信 OAuth 授权 URL，前端用此 URL 生成二维码
 */
export async function GET(request: Request) {
  try {
    const { appId } = getWechatConfig();

    const { searchParams } = new URL(request.url);
    const redirectParam = searchParams.get('redirect') || '/';

    // 生成防 CSRF 的 state 参数
    const state = crypto.randomBytes(16).toString('hex');

    // 回调地址：当前域名 + /api/auth/wechat/callback
    const baseUrl = new URL(request.url).origin;
    const redirectUri = encodeURIComponent(`${baseUrl}/api/auth/wechat/callback`);

    // 微信开放平台网站应用 OAuth 授权 URL
    const authUrl =
      `https://open.weixin.qq.com/connect/qrconnect` +
      `?appid=${appId}` +
      `&redirect_uri=${redirectUri}` +
      `&response_type=code` +
      `&scope=snsapi_login` +
      `&state=${encodeURIComponent(JSON.stringify({ state, redirect: redirectParam }))}` +
      `#wechat_redirect`;

    return NextResponse.json({
      auth_url: authUrl,
      state,
    });
  } catch (error) {
    console.error('WeChat auth URL error:', error);
    const message = error instanceof Error ? error.message : '服务器内部错误';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
