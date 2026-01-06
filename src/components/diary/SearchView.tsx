'use client';

import { useTranslations } from 'next-intl';
import { ArrowLeft, Inbox, CheckCircle2, Circle } from 'lucide-react';
import { useDiaryStore, DiaryEntry } from '@/store/useDiaryStore';
import { useMemo } from 'react';

export default function SearchView() {
  const t = useTranslations('Index');
  const ct = useTranslations('Categories');
  const { 
    entries, 
    searchQuery, setSearchQuery, 
    selectedCategory, setSelectedCategory,
    setView,
    updateEntry
  } = useDiaryStore();

  const filteredEntries = useMemo(() => {
    let result = entries;
    if (searchQuery) {
      result = result.filter(e => e.content.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    if (selectedCategory) {
      result = result.filter(e => e.category === selectedCategory);
    }
    return result;
  }, [entries, searchQuery, selectedCategory]);

  const handleToggleComplete = (entry: DiaryEntry) => {
    updateEntry(entry.id, { completed: !entry.completed });
  };

  const handleBack = () => {
    setView('timeline');
    setSearchQuery('');
    setSelectedCategory(null);
  };

  return (
    <div className="animate-in pt-12">
      <button 
        onClick={handleBack} 
        className="mb-8 flex items-center gap-2 text-slate-400 hover:text-slate-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-xs">{t('return')}</span>
      </button>

      <div className="flex justify-between items-end mb-8 border-b border-slate-100 pb-4">
        <h2 className="text-xl font-medium text-slate-800">
          {selectedCategory ? ct(selectedCategory) : `${t('search')}: ${searchQuery}`}
        </h2>
        <span className="text-xs text-slate-300">{t('entryCount', { count: filteredEntries.length })}</span>
      </div>

      <div className="flex flex-col gap-8">
        {filteredEntries.map((entry) => (
          <div key={entry.id} className={`p-6 bg-white border border-slate-100 rounded-3xl hover:border-blue-100 transition-all group ${entry.completed ? 'opacity-60' : ''}`}>
            <div className="flex justify-between mb-4 items-center">
              <span className="text-[10px] font-bold text-slate-300 tracking-widest uppercase">
                {entry.date} · {entry.time}
              </span>
              <div className="flex items-center gap-2">
                {entry.category === 'TODO' && (
                  <button 
                    onClick={() => handleToggleComplete(entry)}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold transition-colors ${entry.completed ? 'bg-green-50 text-green-500' : 'bg-orange-50 text-orange-500 hover:bg-orange-100'}`}
                  >
                    {entry.completed ? (
                      <>
                        <CheckCircle2 className="w-3 h-3" />
                        {t('completed')}
                      </>
                    ) : (
                      <>
                        <Circle className="w-3 h-3" />
                        {t('pending')}
                      </>
                    )}
                  </button>
                )}
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-50 text-slate-400">
                  {ct(entry.category)}
                </span>
              </div>
            </div>
            <p className={`text-sm leading-relaxed text-slate-600 ${entry.completed ? 'line-through' : ''}`}>
              {entry.content}
            </p>
          </div>
        ))}
        
        {filteredEntries.length === 0 && (
          <div className="text-center py-20">
            <Inbox className="w-12 h-12 text-slate-100 mx-auto mb-4" />
            <p className="text-slate-300 text-sm">{t('noResults')}</p>
          </div>
        )}
      </div>
    </div>
  );
}

