'use client';

import { useTranslations } from 'next-intl';
import { Search, Sparkles, Grid, Menu, Feather } from 'lucide-react';
import { useDiaryStore } from '@/store/useDiaryStore';

export default function Header() {
  const t = useTranslations('Index');
  const { 
    view, setView, 
    isAiMode, setIsAiMode, 
    searchQuery, setSearchQuery,
    setSelectedCategory,
    setIsDrawerOpen 
  } = useDiaryStore();

  return (
    <header className="fixed top-0 w-full z-40 flex flex-col items-center p-6 gap-4">
      <div className="w-full max-w-2xl flex justify-between items-center px-2">
        <h1 className="text-lg font-bold tracking-[0.2em] text-slate-800 flex items-center gap-2">
          <span className="p-1.5 bg-slate-800 rounded-lg">
            <Feather className="w-3.5 h-3.5 text-white" />
          </span>
          {t('title')}
        </h1>
        <div className="flex gap-4 items-center">
          <button 
            onClick={() => { setView('categories'); setSelectedCategory(null); }} 
            className={`p-2 rounded-full transition-colors ${view === 'categories' ? 'bg-slate-100 text-blue-500' : 'text-slate-400'}`}
          >
            <Grid className="w-5 h-5" />
          </button>
          <button onClick={() => setIsDrawerOpen(true)} className="text-slate-400 hover:text-slate-600">
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      <div className="w-full max-w-2xl glass rounded-2xl border border-slate-200/60 shadow-sm flex items-center px-4 py-2">
        {isAiMode ? <Sparkles className="w-4 h-4 text-blue-500" /> : <Search className="w-4 h-4 text-slate-300" />}
        <input 
          type="text" 
          value={searchQuery}
          onChange={(e) => {
            const val = e.target.value;
            setSearchQuery(val);
            if (val && view !== 'search') setView('search');
            if (!val && view === 'search') setView('timeline');
          }}
          placeholder={isAiMode ? t('aiSearch') : t('search')}
          className="flex-1 bg-transparent border-none focus:outline-none px-3 text-sm font-light text-slate-700 placeholder:text-slate-200"
        />
        <button 
          onClick={() => setIsAiMode(!isAiMode)}
          className={`text-[10px] px-2 py-0.5 rounded-full transition-all ${isAiMode ? 'bg-blue-50 text-blue-500' : 'text-slate-300 hover:bg-slate-50'}`}
        >
          {t('aiMode')}
        </button>
      </div>
    </header>
  );
}

