// ============================================
// 全局类型定义
// ============================================

export interface Profile {
  id: string;
  phone: string | null;
  nickname: string | null;
  avatar_url: string | null;
  role: 'user' | 'admin';
  invite_code_used: string | null;
  wechat_openid: string | null;
  wechat_unionid: string | null;
  created_at: string;
  updated_at: string;
}

export interface InviteCode {
  id: string;
  code: string;
  created_by: string | null;
  max_uses: number;
  used_count: number;
  is_active: boolean;
  used_by: string[];
  created_at: string;
  expires_at: string | null;
}

export interface GeneratedContent {
  id: string;
  user_id: string;
  category: string;
  prompt: string;
  result: string;
  created_at: string;
}

export interface WorldviewData {
  mission: {
    title: string;
    content: string[];
  };
  cosmicTree: {
    title: string;
    levels: { name: string; desc: string; beings: string }[];
  };
  lightBody: {
    title: string;
    definition: string;
    types: { name: string; desc: string }[];
  };
  ascension: {
    title: string;
    principles: { name: string; desc: string }[];
    stages: { name: string; desc: string }[];
  };
  narrative: {
    title: string;
    chapters: { title: string; summary: string }[];
  };
  concepts: { name: string; desc: string }[];
  lightBodyMaster: {
    title: string;
    definition: string;
    abilities: string[];
  };
}

export interface DictionaryEntry {
  term: string;
  pinyin: string;
  definition: string;
  analogy: string;
  narrativeUsage: string;
}

export interface PredictionDimension {
  dim: string;
  events: {
    year: string;
    event: string;
    interpretation: string;
  }[];
}

export interface DashboardItem {
  dim: string;
  cur: number;
  target: number;
  trend: 'up' | 'down' | 'stable';
}

export type NavSection =
  | 'worldview'
  | 'dictionary'
  | 'generate'
  | 'ip'
  | 'prediction'
  | 'talent'
  | 'decode'
  | 'sound'
  | 'symbols';
