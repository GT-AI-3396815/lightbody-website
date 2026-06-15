'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { Suspense } from 'react';

function LoginForm() {
  const [tab, setTab] = useState<'login' | 'register'>('login');

  // 登录字段
  const [loginPhone, setLoginPhone] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // 注册字段
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPasswordConfirm, setRegPasswordConfirm] = useState('');
  const [inviteCode, setInviteCode] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!loginPhone || loginPhone.length !== 11) {
      setError('请输入正确的手机号');
      return;
    }
    if (!loginPassword) {
      setError('请输入密码');
      return;
    }

    setLoading(true);
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        phone: loginPhone.trim(),
        password: loginPassword,
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

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!regPhone || regPhone.length !== 11) {
      setError('请输入正确的手机号');
      return;
    }
    if (!regPassword || regPassword.length < 6) {
      setError('密码至少6位');
      return;
    }
    if (regPassword !== regPasswordConfirm) {
      setError('两次密码输入不一致');
      return;
    }

    setLoading(true);
    try {
      // 调用注册 API
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: regPhone.trim(),
          password: regPassword,
          invite_code: inviteCode.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '注册失败');

      // 注册成功后自动登录
      const { error: signInError } = await supabase.auth.signInWithPassword({
        phone: regPhone.trim(),
        password: regPassword,
      });
      if (signInError) throw new Error(signInError.message);

      const redirect = searchParams.get('redirect') || '/';
      router.push(redirect);
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '注册失败');
    } finally {
      setLoading(false);
    }
  };

  const switchTab = (newTab: 'login' | 'register') => {
    setTab(newTab);
    setError('');
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <div className="card w-full max-w-md">
        <div className="text-center mb-6">
          <h2 className="animate-glow">光体文明</h2>
          <p className="text-text-muted text-sm mt-2">登录 / 注册</p>
        </div>

        {/* Tab 切换 */}
        <div className="flex border-b border-border mb-6">
          <button
            className={`flex-1 pb-3 text-sm font-medium transition-colors ${
              tab === 'login'
                ? 'text-primary border-b-2 border-primary'
                : 'text-text-muted hover:text-text'
            }`}
            onClick={() => switchTab('login')}
          >
            登录
          </button>
          <button
            className={`flex-1 pb-3 text-sm font-medium transition-colors ${
              tab === 'register'
                ? 'text-primary border-b-2 border-primary'
                : 'text-text-muted hover:text-text'
            }`}
            onClick={() => switchTab('register')}
          >
            注册
          </button>
        </div>

        {/* 登录表单 */}
        {tab === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-sm text-text-muted block mb-1">手机号</label>
              <input
                type="tel"
                maxLength={11}
                value={loginPhone}
                onChange={(e) => setLoginPhone(e.target.value.replace(/\D/g, ''))}
                placeholder="输入 11 位手机号"
                className="input-field"
                disabled={loading}
              />
            </div>
            <div>
              <label className="text-sm text-text-muted block mb-1">密码</label>
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="输入密码"
                className="input-field"
                disabled={loading}
              />
            </div>
            <button
              type="submit"
              disabled={loading || !loginPhone || !loginPassword}
              className="btn-primary w-full disabled:opacity-50"
            >
              {loading ? '登录中...' : '登录'}
            </button>
          </form>
        )}

        {/* 注册表单 */}
        {tab === 'register' && (
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="text-sm text-text-muted block mb-1">手机号</label>
              <input
                type="tel"
                maxLength={11}
                value={regPhone}
                onChange={(e) => setRegPhone(e.target.value.replace(/\D/g, ''))}
                placeholder="输入 11 位手机号"
                className="input-field"
                disabled={loading}
              />
            </div>
            <div>
              <label className="text-sm text-text-muted block mb-1">设置密码（6 位以上）</label>
              <input
                type="password"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                placeholder="设置登录密码"
                className="input-field"
                disabled={loading}
              />
            </div>
            <div>
              <label className="text-sm text-text-muted block mb-1">确认密码</label>
              <input
                type="password"
                value={regPasswordConfirm}
                onChange={(e) => setRegPasswordConfirm(e.target.value)}
                placeholder="再次输入密码"
                className="input-field"
                disabled={loading}
              />
            </div>
            <div>
              <label className="text-sm text-text-muted block mb-1">邀请码 <span className="text-red-400">*</span></label>
              <input
                type="text"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.trim())}
                placeholder="输入邀请码"
                className="input-field"
                disabled={loading}
              />
            </div>
            <button
              type="submit"
              disabled={loading || !regPhone || !regPassword || !regPasswordConfirm || !inviteCode}
              className="btn-primary w-full disabled:opacity-50"
            >
              {loading ? '注册中...' : '注册'}
            </button>
          </form>
        )}

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
