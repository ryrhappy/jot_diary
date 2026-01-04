'use client';

import { useTranslations } from 'next-intl';
import { ArrowLeft, CheckCircle, Sparkles, Sun, RefreshCw, Heart, MessageSquare } from 'lucide-react';
import { useDiaryStore, Category } from '@/store/useDiaryStore';
import { useMemo } from 'react';

const CATEGORY_CONFIG: Record<Category, { icon: any, color: string }> = {
  TODO: { icon: CheckCircle, color: 'text-orange-400' },
  DREAM: { icon: Sparkles, color: 'text-purple-400' },
  BEAUTIFUL: { icon: Sun, color: 'text-yellow-400' },
  REFLECTION: { icon: RefreshCw, color: 'text-blue-400' },
  GRATITUDE: { icon: Heart, color: 'text-red-400' },
  NORMAL: { icon: MessageSquare, color: 'text-slate-300' }
};

export default function CategoryView() {
  const t = useTranslations('Index');
  const ct = useTranslations('Categories');
  const { entries, setView, setSelectedCategory } = useDiaryStore();

  const stats = useMemo(() => {
    const counts: Record<string, number> = {};
    entries.forEach(e => {
      // For TODO, only count incomplete ones
      if (e.category === 'TODO') {
        if (!e.completed) {
          counts[e.category] = (counts[e.category] || 0) + 1;
        }
      } else {
        counts[e.category] = (counts[e.category] || 0) + 1;
      }
    });
    return counts;
  }, [entries]);

  return (
    <div className="animate-in pt-12">
      <button 
        onClick={() => setView('timeline')} 
        className="mb-8 flex items-center gap-2 text-slate-400 hover:text-slate-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-xs">{t('return')}</span>
      </button>
      
      <h2 className="text-3xl font-bold text-slate-800 mb-2">{t('categories')}</h2>
      <p className="text-sm text-slate-400 mb-10">{t('autoCategorized')}</p>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
        {(Object.keys(CATEGORY_CONFIG) as Category[]).map((cat) => {
          const Config = CATEGORY_CONFIG[cat];
          const Icon = Config.icon;
          return (
            <div 
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                setView('search');
              }}
              className="p-5 bg-white border border-slate-100 rounded-3xl hover:border-blue-200 hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-slate-50 rounded-2xl group-hover:bg-blue-50 transition-colors">
                  <Icon className={`w-5 h-5 ${Config.color}`} />
                </div>
                <span className="text-xs font-bold text-slate-300 group-hover:text-blue-400">
                  {stats[cat] || 0}
                </span>
              </div>
              <h4 className="text-sm font-medium text-slate-700">{ct(cat)}</h4>
            </div>
          );
        })}
      </div>
    </div>
  );
}

