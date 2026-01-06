'use client';

import { useTranslations, useLocale } from 'next-intl';
import { X, Feather, FileDown, FileText, Settings2, Cloud, Languages } from 'lucide-react';
import { useDiaryStore } from '@/store/useDiaryStore';
import { useRouter, usePathname } from '@/i18n/routing';

export default function Sidebar() {
  const t = useTranslations('Index');
  const ct = useTranslations('Categories');
  const st = useTranslations('Settings');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const { entries, isDrawerOpen, setIsDrawerOpen } = useDiaryStore();

  const handleExport = (format: 'md' | 'txt') => {
    const content = entries.map(e => `[${e.date} ${e.time}] [${ct(e.category)}]\n${e.content}\n`).join('\n---\n\n');
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Jot_Diary_${new Date().toISOString().split('T')[0]}.${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (!isDrawerOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div 
        className="absolute inset-0 bg-black/5 backdrop-blur-sm" 
        onClick={() => setIsDrawerOpen(false)} 
      />
      <div className="relative w-full max-w-sm bg-white h-full shadow-2xl flex flex-col p-8 animate-in">
        <div className="flex justify-between items-center mb-12">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center">
              <Feather className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">{t('title')}</h2>
              <p className="text-[10px] text-slate-300 tracking-widest uppercase">Append-Only Life</p>
            </div>
          </div>
          <button onClick={() => setIsDrawerOpen(false)} className="text-slate-300 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-col gap-8">
          <section>
            <h3 className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mb-4">{t('exportMd')}</h3>
            <div className="grid grid-cols-1 gap-2">
              <button 
                onClick={() => handleExport('md')} 
                className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl group hover:bg-blue-50 transition-colors"
              >
                <span className="text-sm text-slate-600 group-hover:text-blue-600">{t('exportMd')}</span>
                <FileDown className="w-4 h-4 text-slate-300" />
              </button>
              <button 
                onClick={() => handleExport('txt')} 
                className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl group hover:bg-slate-100 transition-colors"
              >
                <span className="text-sm text-slate-600">{t('exportTxt')}</span>
                <FileText className="w-4 h-4 text-slate-300" />
              </button>
            </div>
          </section>

          <section>
            <h3 className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mb-4">{t('settings')}</h3>
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between p-4 border border-slate-100 rounded-2xl">
                <div className="flex items-center gap-2">
                  <Cloud className="w-4 h-4 text-slate-400" />
                  <span className="text-sm text-slate-600">Cloud Sync</span>
                </div>
                <div className="w-8 h-4 bg-blue-500 rounded-full relative">
                  <div className="absolute right-1 top-1 w-2 h-2 bg-white rounded-full" />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border border-slate-100 rounded-2xl">
                <div className="flex items-center gap-2">
                  <Languages className="w-4 h-4 text-slate-400" />
                  <span className="text-sm text-slate-600">{st('language')}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => router.replace(pathname, { locale: 'en' })}
                    className={`text-xs px-2 py-1 rounded-md transition-colors ${locale === 'en' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-50'}`}
                  >
                    EN
                  </button>
                  <button
                    onClick={() => router.replace(pathname, { locale: 'zh' })}
                    className={`text-xs px-2 py-1 rounded-md transition-colors ${locale === 'zh' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-50'}`}
                  >
                    中文
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>

        <div className="mt-auto flex flex-col items-center gap-4">
          <div className="p-6 bg-slate-50 rounded-3xl w-full text-center">
            <p className="text-xs text-slate-400 italic">“Records make life more than just fading.”</p>
          </div>
          <span className="text-[10px] text-slate-200 tracking-[0.3em]">MVP VERSION</span>
        </div>
      </div>
    </div>
  );
}

