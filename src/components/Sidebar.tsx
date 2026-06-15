'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { EXTERNAL_LINKS } from '@/lib/data';

const NAV_ITEMS = [
  { id: 'worldview', label: '宇宙观', icon: '◈', href: '/?section=worldview' },
  { id: 'dictionary', label: '术语词典', icon: '◉', href: '/?section=dictionary' },
  { id: 'generate', label: '内容生成', icon: '✧', external: EXTERNAL_LINKS.generate },
  { id: 'ip', label: 'IP打造', icon: '★', external: EXTERNAL_LINKS.ip },
  { id: 'prediction', label: '未来预测', icon: '☼', href: '/?section=prediction' },
  { id: 'talent', label: '天赋测试', icon: '♆', external: EXTERNAL_LINKS.talent },
  { id: 'decode', label: '光体解码', icon: '☽', external: EXTERNAL_LINKS.decode },
  { id: 'sound', label: '光体音流', icon: '♫', external: EXTERNAL_LINKS.sound },
  { id: 'symbols', label: '光体符号库', icon: '⚙', external: EXTERNAL_LINKS.symbols },
];

export default function Sidebar() {
  const [open, setOpen] = useState(false);
  const searchParams = useSearchParams();
  const currentSection = searchParams.get('section') || 'worldview';

  return (
    <>
      <button className="mobile-toggle" onClick={() => setOpen(!open)} aria-label="菜单">
        &#9776;
      </button>
      {open && <div className="md:hidden fixed inset-0 bg-black bg-opacity-60 z-30" onClick={() => setOpen(false)} />}

      <aside className={`sidebar ${open ? 'open' : ''} ${!open ? 'hidden md:block' : ''} fixed md:sticky top-0 left-0 h-screen w-64 bg-surface-900 border-r border-border-subtle overflow-y-auto z-40`}>
        <div className="p-5 border-b border-border-subtle">
          <Link href="/" className="block no-underline" onClick={() => setOpen(false)}>
            <h1 className="text-gold-400 animate-glow text-center">光体文明</h1>
          </Link>
          <p className="text-text-muted text-xs text-center mt-1">INTELLIGENT AGENT · 智能体</p>
          <p className="text-gold-500 text-xs text-center mt-1 tracking-wider">点亮自己，照亮他人</p>
        </div>

        <nav className="p-3 space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = !item.external && currentSection === item.id;

            if (item.external) {
              return (
                <a
                  key={item.id}
                  href={item.external}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="sidebar-link"
                  onClick={() => setOpen(false)}
                >
                  <span className="text-gold-500 w-5 text-center">{item.icon}</span>
                  <span>{item.label}</span>
                  <span className="ml-auto text-text-muted text-xs">↗</span>
                </a>
              );
            }

            return (
              <Link
                key={item.id}
                href={item.href!}
                className={`sidebar-link ${isActive ? 'active' : ''}`}
                onClick={() => setOpen(false)}
              >
                <span className="text-gold-500 w-5 text-center">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}

        </nav>

        <div className="absolute bottom-16 left-0 right-0 p-4 border-t border-border-subtle">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-cyan-500 relative">
              <span className="absolute inset-0 rounded-full bg-cyan-500 animate-ping opacity-75"></span>
            </div>
            <div>
              <p className="text-text-muted text-xs">光频指示器</p>
              <p className="text-cyan-400 text-xs">光体师 · 在线</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
