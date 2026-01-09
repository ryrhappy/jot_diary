'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';
import { Check, Sparkles, Crown, Zap, ArrowLeft, Loader2 } from 'lucide-react';
import Header from '@/components/diary/Header';
import { useAuthStore } from '@/store/useAuthStore';
import AuthModal from '@/components/auth/AuthModal';

// Creem产品ID映射（需要在Creem控制台创建产品后配置）
const CREEM_PRODUCT_IDS: Record<string, string> = {
  pro: process.env.NEXT_PUBLIC_CREEM_PRODUCT_ID_PRO || '',
};

export default function PricingView() {
  const t = useTranslations('Pricing');
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, session, initialize } = useAuthStore();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // 检查支付回调参数
  useEffect(() => {
    const success = searchParams?.get('success');
    const canceled = searchParams?.get('canceled');
    
    if (success === 'true') {
      // 支付成功，可以显示成功消息或跳转
      setError(null);
      // 可以在这里刷新用户订阅状态
    } else if (canceled === 'true') {
      setError('支付已取消');
    }
  }, [searchParams]);

  // 初始化认证状态
  useEffect(() => {
    if (!user) {
      initialize();
    }
  }, [user, initialize]);

  const plans = [
    {
      id: 'free',
      name: t('freePlan'),
      price: t('freePrice'),
      period: '',
      icon: Sparkles,
      features: [
        t('featureBasic'),
        t('featureCategories'),
        t('featureSearch'),
        t('featureExport'),
        t('featureLimit', { count: '100' })
      ],
      buttonText: t('currentPlan'),
      buttonStyle: 'bg-slate-100 text-slate-600 cursor-default',
      popular: false
    },
    {
      id: 'pro',
      name: t('proPlan'),
      price: t('proPrice'),
      period: t('perMonth'),
      icon: Crown,
      features: [
        t('featureUnlimited'),
        t('featureAI'),
        t('featureAdvanced'),
        t('featurePriority'),
        t('featureSupport')
      ],
      buttonText: t('upgradeNow'),
      buttonStyle: 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/30',
      popular: true
    }
  ];

  /**
   * 处理升级/支付
   */
  const handleUpgrade = async (planId: string) => {
    // 检查用户是否登录
    if (!user || !session) {
      setShowAuthModal(true);
      return;
    }

    // 获取产品ID
    const productId = CREEM_PRODUCT_IDS[planId];
    if (!productId) {
      setError('产品配置错误，请联系客服');
      return;
    }

    setLoading(planId);
    setError(null);

    try {
      // 获取访问令牌
      const token = session.access_token;
      
      // 调用API创建支付会话
      const response = await fetch('/api/creem/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId,
          planId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || '创建支付会话失败');
      }

      // 跳转到Creem支付页面
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        throw new Error('未获取到支付链接');
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError(err instanceof Error ? err.message : '支付处理失败，请稍后重试');
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <Header />
      
      {/* 错误提示 */}
      {error && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 max-w-md">
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg shadow-lg">
            <p className="text-sm">{error}</p>
            <button
              onClick={() => setError(null)}
              className="mt-2 text-xs underline hover:no-underline"
            >
              关闭
            </button>
          </div>
        </div>
      )}

      {/* 认证模态框 */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        defaultMode="signin"
      />
      
      <div className="pt-24 pb-16 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-16">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-800 mb-8 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">{t('back')}</span>
            </button>
            
            <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4">
              {t('title')}
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              {t('description')}
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16 max-w-4xl mx-auto">
            {plans.map((plan) => {
              const Icon = plan.icon;
              return (
                <div
                  key={plan.id}
                  className={`
                    relative glass rounded-3xl border p-8 flex flex-col
                    ${plan.popular 
                      ? 'border-blue-200 shadow-2xl shadow-blue-500/10 scale-105 md:scale-110 md:-mt-4' 
                      : 'border-slate-200/60 shadow-xl'
                    }
                    transition-all duration-300 hover:shadow-2xl
                  `}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg">
                        {t('mostPopular')}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-3 mb-6">
                    <div className={`
                      p-3 rounded-2xl
                      ${plan.id === 'free' ? 'bg-slate-100 text-slate-600' : ''}
                      ${plan.id === 'pro' ? 'bg-blue-100 text-blue-600' : ''}
                      ${plan.id === 'premium' ? 'bg-purple-100 text-purple-600' : ''}
                    `}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800">{plan.name}</h3>
                  </div>

                  <div className="mb-6">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold text-slate-800">{plan.price}</span>
                      {plan.period && (
                        <span className="text-slate-500 text-sm">{plan.period}</span>
                      )}
                    </div>
                  </div>

                  <ul className="flex-1 space-y-4 mb-8">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className="mt-0.5 flex-shrink-0">
                          <Check className="w-5 h-5 text-green-500" />
                        </div>
                        <span className="text-sm text-slate-600 leading-relaxed">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => handleUpgrade(plan.id)}
                    disabled={plan.id === 'free' || loading === plan.id}
                    className={`
                      w-full py-4 rounded-2xl font-medium transition-all duration-300
                      ${plan.buttonStyle}
                      ${plan.id !== 'free' && loading !== plan.id ? 'active:scale-95' : ''}
                      ${loading === plan.id ? 'opacity-75 cursor-wait' : ''}
                    `}
                  >
                    {loading === plan.id ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        {t('processing')}
                      </span>
                    ) : (
                      plan.buttonText
                    )}
                  </button>
                </div>
              );
            })}
          </div>

          {/* FAQ Section */}
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-slate-800 text-center mb-8">
              {t('faqTitle')}
            </h2>
            <div className="space-y-4">
              {[
                { q: t('faq1Q'), a: t('faq1A') },
                { q: t('faq2Q'), a: t('faq2A') },
                { q: t('faq3Q'), a: t('faq3A') },
                { q: t('faq4Q'), a: t('faq4A') }
              ].map((faq, index) => (
                <div
                  key={index}
                  className="glass rounded-2xl border border-slate-200/60 p-6"
                >
                  <h3 className="font-semibold text-slate-800 mb-2">{faq.q}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

