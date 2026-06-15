'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import QRCode from 'qrcode';

type LoginTab = 'wechat' | 'phone';

function LoginForm() {
  const [activeTab, setActiveTab] = useState<LoginTab>('wechat');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  // ---- 微信扫码登录 ----
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [wechatState, setWechatState] = useState('');
  const [qrLoading, setQrLoading] = useState(true);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 生成二维码
  useEffect(() => {
    if (activeTab !== 'wechat') return;

    let cancelled = false;

    async function generateQR() {
      setQrLoading(true);
      setError('');

      try {
        const redirect = searchParams.get('redirect') || '/';
        const res = await fetch(`/api/auth/wechat?redirect=${encodeURIComponent(redirect)}`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || '获取授权链接失败');
        }

        if (cancelled) return;

        setWechatState(data.state);

        // 用 qrcode 库生成 data URL
        const dataUrl = await QRCode.toDataURL(data.auth_url, {
          width: 220,
          margin: 2,
          color: {
            dark: '#b8860b',
            light: '#0f0f1e',
          },
        });

        if (cancelled) return;
        setQrDataUrl(dataUrl);

        // 开始轮询状态
        startPolling(data.state);
      } catch (err: unknown) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : '加载失败');
        }
      } finally {
        if (!cancelled) setQrLoading(false);
      }
    }

    generateQR();

    return () => {
      cancelled = true;
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [activeTab]);

  function startPolling(state: string) {
    if (pollRef.current) clearInterval(pollRef.current);

    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/auth/wechat/status?state=${state}`);
        const data = await res.json();

        if (data.status === 'login') {
          // 已完成登录
          if (pollRef.current) clearInterval(pollRef.current);
          window.location.href = `/api/auth/wechat/login?token=${data.token}&redirect=${searchParams.get('redirect') || '/'}`;
        } else if (data.status === 'bind_phone') {
          // 需要绑定手机号
          if (pollRef.current) clearInterval(pollRef.current);
          router.push(`/auth/bind-phone?token=${data.token}`);
        }
      } catch {
        // 轮询失败继续
      }
    }, 3000);
  }

  // ---- 手机号登录 ----
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  const handlePhoneLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!phone || phone.length !== 11) {
      setError('请输入正确的手机号');
      return;
    }
    if (!password) {
      setError('请输入密码');
      return;
    }

    setLoading(true);

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        phone: phone.trim(),
        password,
      });

      if (signInError) {
        if (signInError.message.includes('Invalid login')) {
          throw new Error('手机号或密码错误');
        }
        throw new Error(signInError.message);
      }

      const redirect = searchParams.get('redirect') || '/';
      router.push(redirect);
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '登录失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <div className="card w-full max-w-md">
        <div className="text-center mb-6">
          <h2 className="animate-glow">光体文明</h2>
          <p className="text-text-muted text-sm mt-2">登录 / 注册</p>
        </div>

        {/* Tab 切换 */}
        <div className="flex mb-6 border-b border-border-subtle">
          <button
            onClick={() => setActiveTab('wechat')}
            className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
              activeTab === 'wechat'
                ? 'text-gold-400 border-b-2 border-gold-500'
                : 'text-text-muted hover:text-text-secondary'
            }`}
          >
            微信扫码登录
          </button>
          <button
            onClick={() => setActiveTab('phone')}
            className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
              activeTab === 'phone'
                ? 'text-gold-400 border-b-2 border-gold-500'
                : 'text-text-muted hover:text-text-secondary'
            }`}
          >
            手机号登录
          </button>
        </div>

        {/* 微信扫码登录 Tab */}
        {activeTab === 'wechat' && (
          <div className="flex flex-col items-center space-y-4">
            {qrLoading ? (
              <div className="w-[220px] h-[220px] flex items-center justify-center bg-surface-900 rounded-lg border border-border-subtle">
                <span className="text-text-muted text-sm">加载中...</span>
              </div>
            ) : qrDataUrl ? (
              <div className="p-3 bg-white rounded-lg">
                <img
                  src={qrDataUrl}
                  alt="微信扫码登录"
                  width={220}
                  height={220}
                />
              </div>
            ) : (
              <div className="w-[220px] h-[220px] flex items-center justify-center bg-surface-900 rounded-lg border border-border-subtle">
                <span className="text-text-muted text-sm">二维码加载失败</span>
              </div>
            )}

            <p className="text-text-muted text-sm">请使用微信扫一扫登录</p>

            <p className="text-text-muted text-xs text-center leading-relaxed">
              还没有账号？扫码后自动注册<br />
              或切换到「手机号登录」使用已有账号
            </p>
          </div>
        )}

        {/* 手机号登录 Tab */}
        {activeTab === 'phone' && (
          <form onSubmit={handlePhoneLogin} className="space-y-4">
            <div>
              <label className="text-sm text-text-muted block mb-1">手机号</label>
              <input
                type="tel"
                maxLength={11}
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                placeholder="输入 11 位手机号"
                className="input-field"
                disabled={loading}
              />
            </div>

            <div>
              <label className="text-sm text-text-muted block mb-1">密码</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="输入密码"
                className="input-field"
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading || !phone || !password}
              className="btn-primary w-full disabled:opacity-50"
            >
              {loading ? '登录中...' : '登录'}
            </button>

            <p className="text-text-muted text-xs text-center leading-relaxed">
              还没有账号？请使用微信扫码自动注册
            </p>
          </form>
        )}

        {/* 错误提示 */}
        {error && (
          <div className="mt-4 p-3 bg-red-900 bg-opacity-20 border border-red-800 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-text-muted">加载中...</div>}>
      <LoginForm />
    </Suspense>
  );
}
