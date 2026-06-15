'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase';

function BindPhoneForm() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('缺少认证令牌，请重新扫码');
      return;
    }

    if (!phone || phone.length !== 11) {
      setError('请输入正确的手机号');
      return;
    }

    if (!password || password.length < 6) {
      setError('密码至少 6 位');
      return;
    }

    setLoading(true);

    try {
      // 1. 调用绑定 API
      const res = await fetch('/api/auth/bind-phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          phone: phone.trim(),
          password,
          invite_code: inviteCode.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || '绑定失败');
      }

      // 2. 绑定成功后自动登录
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        phone: phone.trim(),
        password,
      });

      if (signInError) {
        throw new Error(signInError.message);
      }

      // 3. 跳转首页
      router.push('/');
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '绑定失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <div className="card w-full max-w-md">
        <div className="text-center mb-6">
          <h2 className="animate-glow">光体文明</h2>
          <p className="text-text-muted text-sm mt-2">
            微信扫码成功，请绑定手机号完成注册
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
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
            <label className="text-sm text-text-muted block mb-1">设置密码（6 位以上）</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="设置登录密码"
              className="input-field"
              disabled={loading}
            />
          </div>

          <div>
            <label className="text-sm text-text-muted block mb-1">邀请码（选填）</label>
            <input
              type="text"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.trim())}
              placeholder="如有邀请码请在此输入"
              className="input-field"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full disabled:opacity-50"
          >
            {loading ? '注册中...' : '完成注册'}
          </button>

          {error && (
            <div className="p-3 bg-red-900 bg-opacity-20 border border-red-800 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

export default function BindPhonePage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-text-muted">加载中...</div>}>
      <BindPhoneForm />
    </Suspense>
  );
}
