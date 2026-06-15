-- ============================================
-- 微信扫码登录 - 数据库迁移
-- 在 Supabase SQL Editor 中执行此文件
-- ============================================

-- 1. 为 profiles 表添加微信相关字段
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS wechat_openid VARCHAR UNIQUE,
  ADD COLUMN IF NOT EXISTS wechat_unionid VARCHAR;

-- 2. 创建微信认证临时 token 表
CREATE TABLE IF NOT EXISTS public.wechat_auth_tokens (
  token VARCHAR PRIMARY KEY,
  openid VARCHAR NOT NULL,
  unionid VARCHAR,
  state VARCHAR,
  status VARCHAR DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN DEFAULT FALSE
);

ALTER TABLE public.wechat_auth_tokens ENABLE ROW LEVEL SECURITY;

-- 3. 索引
CREATE INDEX IF NOT EXISTS idx_wechat_tokens_state ON public.wechat_auth_tokens(state);
CREATE INDEX IF NOT EXISTS idx_wechat_tokens_expires ON public.wechat_auth_tokens(expires_at);
CREATE INDEX IF NOT EXISTS idx_profiles_wechat_openid ON public.profiles(wechat_openid);
