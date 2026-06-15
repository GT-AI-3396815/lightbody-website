'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';

interface User {
  id: string;
  phone: string;
  role: string;
  created_at: string;
}

interface InviteCode {
  id: string;
  code: string;
  is_used: boolean;
  used_by: string | null;
  created_at: string;
}

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [invites, setInvites] = useState<InviteCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<'users' | 'invites'>('users');
  const [newInviteAmount, setNewInviteAmount] = useState(5);
  const router = useRouter();
  const supabase = createClient();

  const checkAuth = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { router.push('/auth/login?redirect=/admin'); return false; }
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', session.user.id).single();
    if (!profile || profile.role !== 'admin') { router.push('/'); return false; }
    return true;
  }, [supabase, router]);

  const fetchData = useCallback(async (page: 'users' | 'invites') => {
    setLoading(true);
    setError('');
    try {
      if (page === 'users') {
        const res = await fetch('/api/admin/users');
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setUsers(data.users);
      } else {
        const res = await fetch('/api/admin/invites');
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setInvites(data.codes);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '加载失败');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    checkAuth().then(ok => { if (ok) fetchData('users'); });
  }, [checkAuth, fetchData]);

  const generateInvites = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/invites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ count: newInviteAmount })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      fetchData('invites');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '生成失败');
    } finally { setLoading(false); }
  };

  const deleteInvite = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/invites?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      fetchData('invites');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '删除失败');
    }
  };

  const updateUserRole = async (userId: string, role: string) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, role })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      fetchData('users');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '更新失败');
    }
  };

  return (
    <div>
      <div className="section-header flex items-center justify-between">
        <div>
          <h2>管理后台</h2>
          <p className="desc">用户管理 · 邀请码管理</p>
        </div>
        <div className="flex gap-2">
          <button className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${tab === 'users' ? 'bg-gold-500 text-white' : 'bg-surface-700 text-text-muted hover:text-text-primary'}`} onClick={() => { setTab('users'); fetchData('users'); }}>用户管理</button>
          <button className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${tab === 'invites' ? 'bg-gold-500 text-white' : 'bg-surface-700 text-text-muted hover:text-text-primary'}`} onClick={() => { setTab('invites'); fetchData('invites'); }}>邀请码</button>
        </div>
      </div>

      {error && <div className="card bg-red-900 bg-opacity-20 border-red-800 text-red-400 text-sm">{error}</div>}

      {tab === 'users' && (
        <div className="card">
          <h3>用户列表（{users.length}）</h3>
          {loading ? (
            <div className="text-text-muted text-center py-10">加载中...</div>
          ) : (
            <div className="table-wrap mt-4">
              <table>
                <thead>
                  <tr><th>手机号</th><th>角色</th><th>注册时间</th><th>操作</th></tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id}>
                      <td>{u.phone}</td>
                      <td><span className={`badge ${u.role === 'admin' ? 'badge-gold' : 'badge-cyan'}`}>{u.role}</span></td>
                      <td>{new Date(u.created_at).toLocaleString('zh-CN')}</td>
                      <td>
                        <select
                          value={u.role}
                          onChange={(e) => updateUserRole(u.id, e.target.value)}
                          className="bg-surface-900 border border-border-subtle rounded px-2 py-1 text-xs text-text-primary"
                        >
                          <option value="user">user</option>
                          <option value="admin">admin</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {tab === 'invites' && (
        <div className="card">
          <h3>邀请码管理</h3>
          <div className="flex items-center gap-3 mt-4 mb-6">
            <input
              type="number"
              min={1}
              max={100}
              value={newInviteAmount}
              onChange={(e) => setNewInviteAmount(parseInt(e.target.value) || 1)}
              className="input-field w-24"
            />
            <button onClick={generateInvites} disabled={loading} className="btn-primary">生成邀请码</button>
          </div>

          {loading ? (
            <div className="text-text-muted text-center py-10">加载中...</div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>邀请码</th><th>状态</th><th>使用者</th><th>创建时间</th><th>操作</th></tr>
                </thead>
                <tbody>
                  {invites.map(inv => (
                    <tr key={inv.id}>
                      <td><code className="bg-surface-900 px-2 py-0.5 rounded text-gold-500 text-xs">{inv.code}</code></td>
                      <td><span className={`badge ${inv.is_used ? 'badge-cyan' : 'badge-gold'}`}>{inv.is_used ? '已使用' : '未使用'}</span></td>
                      <td className="text-xs">{inv.used_by || '-'}</td>
                      <td className="text-xs">{new Date(inv.created_at).toLocaleString('zh-CN')}</td>
                      <td>
                        {!inv.is_used && (
                          <button onClick={() => deleteInvite(inv.id)} className="text-red-400 hover:text-red-300 text-xs">删除</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
