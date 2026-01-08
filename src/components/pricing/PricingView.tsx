'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { Check, Sparkles, Crown, Zap, ArrowLeft } from 'lucide-react';
import Header from '@/components/diary/Header';

export default function PricingView() {
  const t = useTranslations('Pricing');
  const router = useRouter();

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
    },
    {
      id: 'premium',
      name: t('premiumPlan'),
      price: t('premiumPrice'),
      period: t('perMonth'),
      icon: Zap,
      features: [
        t('featureAllPro'),
        t('featureCustom'),
        t('featureAPI'),
        t('featureDedicated'),
        t('featureEarly')
      ],
      buttonText: t('upgradeNow'),
      buttonStyle: 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 shadow-lg shadow-purple-500/30',
      popular: false
    }
  ];

  const handleUpgrade = (planId: string) => {
    // TODO: 实现支付逻辑
    console.log('Upgrading to:', planId);
    // 这里可以集成 Stripe、支付宝、微信支付等
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <Header />
      
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
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
                    disabled={plan.id === 'free'}
                    className={`
                      w-full py-4 rounded-2xl font-medium transition-all duration-300
                      ${plan.buttonStyle}
                      ${plan.id !== 'free' ? 'active:scale-95' : ''}
                    `}
                  >
                    {plan.buttonText}
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

