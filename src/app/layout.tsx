import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '光体文明 · 智能体',
  description: '以光为介质，以意识为结构——光体文明的宇宙模型、光体定义、升维理论与叙事主线',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
