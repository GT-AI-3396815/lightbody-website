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

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();
  const supabase = createClient();

  const checkAuth = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { router.push('/auth/login?redirect=/admin'); return false; }
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', session.user.id).single();
    if (!profile || profile.role !== 'admin') { router.push('/'); return false; }
    return true;
  }, [supabase, router]);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setUsers(data.users);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '加载失败');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    checkAuth().then(ok => { if (ok) fetchUsers(); });
  }, [checkAuth, fetchUsers]);

  const updateUserRole = async (userId: string, role: string) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, role })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      fetchUsers();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '更新失败');
    }
  };

  return (
    <div>
      <div className="section-header">
        <h2>管理后台</h2>
        <p className="desc">用户管理</p>
      </div>

      {error && <div className="card bg-red-900 bg-opacity-20 border-red-800 text-red-400 text-sm">{error}</div>}

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
    </div>
  );
}
