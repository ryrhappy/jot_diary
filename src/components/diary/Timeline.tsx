'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useDiaryStore } from '@/store/useDiaryStore';
import { Trash2, Edit3, Check, X, AlertCircle } from 'lucide-react';

export default function Timeline() {
  const t = useTranslations('Index');
  const { entries, deleteEntry, updateEntry } = useDiaryStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const today = new Date();
  const dateStr = today.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' });
  const weekday = today.toLocaleDateString('zh-CN', { weekday: 'long' });

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
              <h3 className="text-xl font-bold text-slate-800">确认删除？</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                这条日记删除后将无法找回，请确认是否继续操作。
              </p>
              <div className="flex gap-3 w-full mt-4">
                <button 
                  onClick={() => setDeleteConfirmId(null)}
                  className="flex-1 px-6 py-3 rounded-2xl bg-slate-50 text-slate-400 text-sm font-bold hover:bg-slate-100 transition-colors"
                >
                  取消
                </button>
                <button 
                  onClick={() => confirmDelete(deleteConfirmId)}
                  className="flex-1 px-6 py-3 rounded-2xl bg-red-500 text-white text-sm font-bold shadow-lg shadow-red-200 hover:bg-red-600 active:scale-95 transition-all"
                >
                  确认删除
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Date Display */}
      <div className="mb-16 text-center md:text-left flex flex-col md:flex-row md:items-baseline gap-4 pt-12">
        <span className="text-6xl md:text-7xl font-light font-serif text-slate-200 leading-none">
          {today.getDate().toString().padStart(2, '0')}
        </span>
        <div className="flex flex-col">
          <span className="text-xl font-bold text-slate-800">{dateStr}</span>
          <span className="text-sm font-medium text-slate-300 tracking-[0.2em] uppercase">{weekday}</span>
        </div>
      </div>

      <div className="relative">
        <div className="timeline-line hidden md:block"></div>
        <div className="flex flex-col gap-16">
          {entries.map((entry) => (
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
                    <p className={`text-[15px] leading-relaxed text-slate-600 font-normal whitespace-pre-wrap pr-16 ${entry.completed ? 'line-through opacity-60' : ''}`}>
                      {entry.content}
                    </p>
                    <div className="absolute top-0 right-0 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleEdit(entry.id, entry.content)}
                        className="p-2 rounded-full text-slate-300 hover:text-slate-600 hover:bg-slate-50 transition-all"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(entry.id)}
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

