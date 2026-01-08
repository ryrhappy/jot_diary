'use client';

import { useEffect } from 'react';
import { useRouter } from '@/i18n/routing';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/useAuthStore';
import { Loader2 } from 'lucide-react';

/**
 * OAuth 回调页面
 * 处理 Supabase OAuth 登录后的重定向
 */
export default function AuthCallback() {
  const router = useRouter();
  const { initialize } = useAuthStore();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // 获取 URL 中的 hash 参数（Supabase OAuth 回调会在这里）
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth callback error:', error);
          // 重定向到主页，让用户重新尝试登录
          router.push('/');
          return;
        }

        if (session) {
          // 重新初始化认证状态
          await initialize();
          // 重定向到主页
          router.push('/');
        } else {
          // 如果没有会话，也重定向到主页
          router.push('/');
        }
      } catch (err) {
        console.error('Error handling auth callback:', err);
        router.push('/');
      }
    };

    handleAuthCallback();
  }, [router, initialize]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400 mx-auto mb-4" />
        <p className="text-slate-600">正在完成登录...</p>
      </div>
    </div>
  );
}

