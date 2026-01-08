'use client';

import { useState, useMemo } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useDiaryStore, Category, DiaryEntry } from '@/store/useDiaryStore';
import { Trash2, Edit3, Check, X, AlertCircle, ListTodo, Sun, Brain } from 'lucide-react';

export default function Timeline() {
  const t = useTranslations('Index');
  const locale = useLocale();
  const { entries, deleteEntry, updateEntry, selectedCategory, setSelectedCategory } = useDiaryStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const today = new Date();
  const dateStr = today.toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-US', { month: 'long', day: 'numeric' });
  const weekday = today.toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-US', { weekday: 'long' });

  const filteredEntries = useMemo(() => {
    if (!selectedCategory) return entries;
    return entries.filter(entry => entry.category === selectedCategory);
  }, [entries, selectedCategory]);

  // 统计各分类的数量
  const categoryCounts = useMemo(() => {
    const counts: Record<Category, number> = {
      TODO: 0,
      DREAM: 0,
      BEAUTIFUL: 0,
      REFLECTION: 0,
      GRATITUDE: 0,
      NORMAL: 0
    };
    
    entries.forEach(entry => {
      if (entry.category === 'TODO') {
        // TODO 只统计未完成的
        if (!entry.completed) {
          counts.TODO++;
        }
      } else {
        counts[entry.category]++;
      }
    });
    
    return counts;
  }, [entries]);

  const handleEdit = (id: string, content: string) => {
    setEditingId(id);
    setEditContent(content);
  };

  const handleSave = (id: string) => {
    if (editContent.trim()) {
      updateEntry(id, { content: editContent });
    }
    setEditingId(null);
  };

  const confirmDelete = (id: string) => {
    deleteEntry(id);
    setDeleteConfirmId(null);
  };

  const handleToggleComplete = (entry: DiaryEntry) => {
    if (entry.category === 'TODO') {
      updateEntry(entry.id, { completed: !entry.completed });
    }
  };

  const categories = [
    { id: 'TODO' as Category, icon: ListTodo, label: t('categoryTodo'), color: 'text-orange-500', bg: 'bg-orange-50' },
    { id: 'BEAUTIFUL' as Category, icon: Sun, label: t('categoryBeautiful'), color: 'text-yellow-500', bg: 'bg-yellow-50' },
    { id: 'REFLECTION' as Category, icon: Brain, label: t('categoryReflection'), color: 'text-purple-500', bg: 'bg-purple-50' },
  ];

  return (
    <div className="animate-in">
      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in" onClick={() => setDeleteConfirmId(null)} />
          <div className="relative w-full max-w-sm glass rounded-3xl p-8 shadow-2xl animate-in zoom-in slide-in-from-bottom-4">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="p-4 bg-red-50 rounded-2xl">
                <AlertCircle className="w-8 h-8 text-red-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-800">{t('deleteTitle')}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                {t('deleteDescription')}
              </p>
              <div className="flex gap-3 w-full mt-4">
                <button 
                  onClick={() => setDeleteConfirmId(null)}
                  className="flex-1 px-6 py-3 rounded-2xl bg-slate-50 text-slate-400 text-sm font-bold hover:bg-slate-100 transition-colors"
                >
                  {t('cancel')}
                </button>
                <button 
                  onClick={() => confirmDelete(deleteConfirmId)}
                  className="flex-1 px-6 py-3 rounded-2xl bg-red-500 text-white text-sm font-bold shadow-lg shadow-red-200 hover:bg-red-600 active:scale-95 transition-all"
                >
                  {t('deleteButton')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sticky Date and Categories */}
      <div className="sticky top-20 z-30 bg-white/80 backdrop-blur-md py-6 mb-8 border-b border-slate-100 -mx-6 px-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-baseline gap-4">
            <span className="text-5xl font-light font-serif text-slate-200 leading-none">
              {today.getDate().toString().padStart(2, '0')}
            </span>
            <div className="flex flex-col">
              <span className="text-lg font-bold text-slate-800">{dateStr}</span>
              <span className="text-xs font-medium text-slate-300 tracking-[0.2em] uppercase">{weekday}</span>
            </div>
          </div>

          <div className="flex gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  selectedCategory === cat.id 
                    ? `${cat.bg} ${cat.color} ring-1 ring-current shadow-sm` 
                    : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                }`}
              >
                <cat.icon className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
                {categoryCounts[cat.id] > 0 && (
                  <span className={`ml-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                    selectedCategory === cat.id 
                      ? 'bg-white/30' 
                      : 'bg-slate-200 text-slate-500'
                  }`}>
                    {categoryCounts[cat.id]}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="relative">
        <div className="timeline-line hidden md:block"></div>
        <div className="flex flex-col gap-12">
          {filteredEntries.map((entry) => (
            <div key={entry.id} className="flex flex-col md:flex-row gap-4 md:gap-0 group">
              <div className="md:w-32 flex-shrink-0 pt-1 flex flex-col gap-2">
                <span className="text-xs font-medium text-slate-300 tracking-wider group-hover:text-slate-400 transition-colors">
                  {entry.time}
                </span>
              </div>
              <div className="flex-1 relative">
                {editingId === entry.id ? (
                  <div className="flex flex-col gap-2">
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-[15px] leading-relaxed text-slate-600 focus:outline-none focus:ring-1 focus:ring-blue-100"
                      rows={3}
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSave(entry.id)}
                        className="p-2 rounded-full bg-slate-800 text-white hover:bg-slate-700 transition-colors"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="p-2 rounded-full bg-slate-100 text-slate-400 hover:bg-slate-200 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div 
                      className={`relative ${entry.category === 'TODO' ? 'cursor-pointer' : ''}`}
                      onClick={() => entry.category === 'TODO' && handleToggleComplete(entry)}
                    >
                      <p className={`text-[15px] leading-relaxed text-slate-600 font-normal whitespace-pre-wrap pr-16 ${entry.completed ? 'line-through opacity-60' : ''}`}>
                        {entry.content}
                      </p>
                      {entry.category === 'TODO' && (
                        <div className="absolute -left-6 top-0 flex items-center h-full">
                          <div className={`w-4 h-4 rounded-full border-2 transition-all ${
                            entry.completed 
                              ? 'bg-green-500 border-green-500' 
                              : 'border-orange-300 hover:border-orange-400'
                          }`}>
                            {entry.completed && (
                              <Check className="w-3 h-3 text-white m-0.5" />
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="absolute top-0 right-0 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(entry.id, entry.content);
                        }}
                        className="p-2 rounded-full text-slate-300 hover:text-slate-600 hover:bg-slate-50 transition-all"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteConfirmId(entry.id);
                        }}
                        className="p-2 rounded-full text-slate-300 hover:text-red-400 hover:bg-red-50 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

