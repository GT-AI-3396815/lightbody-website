'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
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

      <aside className={`sidebar ${open ? 'open' : ''} ${!open ? 'hidden md:block' : ''} fixed md:sticky top-0 left-0 h-screen w-64 overflow-y-auto z-40`}>
        {/* Logo 区域 */}
        <div className="relative p-6 border-b border-border-subtle">
          {/* 背景光晕 */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full bg-gold-500 opacity-[0.04] blur-3xl" />
          </div>

          <Link href="/" className="flex flex-col items-center no-underline group" onClick={() => setOpen(false)}>
            <div className="relative mb-3 transition-transform duration-500 group-hover:scale-105">
              <div className="absolute inset-0 rounded-full bg-gold-500 opacity-20 blur-xl group-hover:opacity-30 transition-opacity duration-500" />
              <Image
                src="/logo.svg"
                alt="光体文明 Logo"
                width={72}
                height={72}
                className="relative drop-shadow-[0_0_12px_rgba(212,160,23,0.4)]"
                priority
              />
            </div>
            <h1 className="text-xl text-center animate-glow-breath">
              光体文明
            </h1>
          </Link>
          <p className="text-text-muted text-xs text-center mt-2 tracking-widest uppercase">
            Lightbody Agent
          </p>
          <p className="text-gold-400 text-xs text-center mt-1 tracking-wider opacity-70">
            点亮自己，照亮他人
          </p>
        </div>

        {/* 导航 */}
        <nav className="p-3 space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const isActive = !item.external && currentSection === item.id;

            if (item.external) {
              return (
                <a
                  key={item.id}
                  href={item.external}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="sidebar-link group"
                  onClick={() => setOpen(false)}
                >
                  <span className="text-gold-400 w-5 text-center text-base">{item.icon}</span>
                  <span>{item.label}</span>
                  <span className="ml-auto text-text-muted text-xs opacity-0 group-hover:opacity-100 transition-opacity">↗</span>
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
                <span className="text-gold-400 w-5 text-center text-base">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* 底部状态指示器 */}
        <div className="absolute bottom-16 left-0 right-0 p-4 border-t border-border-subtle">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(77,208,225,0.6)]" />
              <span className="absolute inset-0 rounded-full bg-cyan-400 animate-ping opacity-40" />
            </div>
            <div>
              <p className="text-text-muted text-xs">光频指示器</p>
              <p className="text-cyan-300 text-xs font-medium">光体师 · 在线</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
