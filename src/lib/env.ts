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
