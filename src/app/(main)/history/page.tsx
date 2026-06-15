'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';

interface ContentItem {
  id: string;
  prompt: string;
  category: string;
  result: string;
  created_at: string;
}

export default function HistoryPage() {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const router = useRouter();
  const supabase = createClient();

  const checkAuth = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { router.push('/auth/login?redirect=/history'); return false; }
    return true;
  }, [supabase, router]);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/content/history');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setItems(data.items);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '加载失败');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    checkAuth().then(ok => { if (ok) fetchHistory(); });
  }, [checkAuth, fetchHistory]);

  const toggleExpand = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div>
      <div className="section-header">
        <h2>生成历史</h2>
        <p className="desc">查看所有已保存的内容生成记录</p>
      </div>

      {error && <div className="card bg-red-900 bg-opacity-20 border-red-800 text-red-400 text-sm">{error}</div>}

      {loading ? (
        <div className="text-text-muted text-center py-20">加载中...</div>
      ) : items.length === 0 ? (
        <div className="card text-center py-16">
          <p className="text-text-muted">暂无生成记录</p>
          <p className="text-text-muted text-xs mt-2">前往"内容生成"页面创建第一条内容</p>
        </div>
      ) : (
        <div>
          {items.map(item => (
            <div key={item.id} className="card">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="badge badge-gold">{item.category}</span>
                    <span className="text-text-muted text-xs">{new Date(item.created_at).toLocaleString('zh-CN')}</span>
                  </div>
                  <p className="text-text-primary text-sm font-semibold">Prompt：{item.prompt}</p>
                  {expanded.has(item.id) && (
                    <div className="mt-4 bg-surface-900 border border-border-subtle rounded-lg p-4 text-text-secondary text-sm leading-relaxed whitespace-pre-wrap">
                      {item.result}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => toggleExpand(item.id)}
                  className="text-text-muted hover:text-text-primary text-xs ml-4 flex-shrink-0"
                >
                  {expanded.has(item.id) ? '收起' : '展开'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
