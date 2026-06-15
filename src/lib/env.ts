// ============================================
// 环境变量类型声明
// ============================================

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NEXT_PUBLIC_SUPABASE_URL: string;
      NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
      SUPABASE_SERVICE_ROLE_KEY: string;
      DEEPSEEK_API_KEY: string;
      DEEPSEEK_MODEL: string;
      WECHAT_APP_ID: string;
      WECHAT_APP_SECRET: string;
    }
  }
}

export {};

export function getWechatConfig() {
  const appId = process.env.WECHAT_APP_ID;
  const appSecret = process.env.WECHAT_APP_SECRET;

  if (!appId || !appSecret) {
    throw new Error('缺少微信配置：请设置 WECHAT_APP_ID 和 WECHAT_APP_SECRET 环境变量');
  }

  return { appId, appSecret };
}
