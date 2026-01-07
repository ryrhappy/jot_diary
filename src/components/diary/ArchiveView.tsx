'use client';

import { useState, useMemo } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useDiaryStore } from '@/store/useDiaryStore';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { formatLocalDate } from '@/lib/date-utils';

export default function ArchiveView() {
  const t = useTranslations('Index');
  const locale = useLocale();
  const { entries, archiveDate, setArchiveDate } = useDiaryStore();
  const [currentMonth, setCurrentMonth] = useState(new Date(archiveDate));

  // Calendar logic
  const daysInMonth = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];

    // Add empty slots for days before the first day of the month
    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null);
    }

    // Add days of the month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  }, [currentMonth]);

  const monthName = currentMonth.toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-US', { month: 'long', year: 'numeric' });

  const filteredEntries = useMemo(() => {
    return entries.filter(entry => entry.date === archiveDate);
  }, [entries, archiveDate]);

  const hasEntries = (date: Date) => {
    const dateStr = formatLocalDate(date);
    return entries.some(entry => entry.date === dateStr);
  };

  const changeMonth = (offset: number) => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + offset, 1));
  };

  const weekDays = locale === 'zh' ? ['日', '一', '二', '三', '四', '五', '六'] : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Calendar Header */}
      <div className="glass rounded-3xl p-6 border border-slate-200/60 shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-slate-400" />
            {monthName}
          </h2>
          <div className="flex gap-2">
            <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
              <ChevronLeft className="w-5 h-5 text-slate-400" />
            </button>
            <button onClick={() => changeMonth(1)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
              <ChevronRight className="w-5 h-5 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {weekDays.map(day => (
            <div key={day} className="text-center text-[10px] font-bold text-slate-300 uppercase tracking-widest py-2">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-2">
          {daysInMonth.map((date, idx) => {
            if (!date) return <div key={`empty-${idx}`} />;
            
            const dateStr = formatLocalDate(date);
            const isSelected = archiveDate === dateStr;
            const hasData = hasEntries(date);
            const isToday = formatLocalDate(new Date()) === dateStr;

            return (
              <button
                key={dateStr}
                onClick={() => setArchiveDate(dateStr)}
                className={`
                  relative h-10 w-full flex items-center justify-center rounded-xl text-sm transition-all
                  ${isSelected ? 'bg-slate-800 text-white shadow-md scale-105 z-10' : 'text-slate-600 hover:bg-slate-50'}
                  ${isToday && !isSelected ? 'ring-1 ring-slate-200' : ''}
                `}
              >
                {date.getDate()}
                {hasData && !isSelected && (
                  <div className="absolute bottom-1.5 w-1 h-1 bg-blue-400 rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Daily Content */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">
            {new Date(archiveDate).toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-US', { month: 'long', day: 'numeric', weekday: 'long' })}
          </h3>
          <span className="text-xs text-slate-300">{filteredEntries.length} {t('entryCount', { count: filteredEntries.length })}</span>
        </div>

        <div className="flex flex-col gap-4">
          {filteredEntries.length > 0 ? (
            filteredEntries.map((entry) => (
              <div key={entry.id} className="glass rounded-2xl p-6 border border-slate-100 hover:border-slate-200 transition-all group">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2 text-[10px] font-medium text-slate-300 uppercase tracking-wider">
                    <Clock className="w-3 h-3" />
                    {entry.time}
                  </div>
                </div>
                <p className="text-[15px] leading-relaxed text-slate-600 whitespace-pre-wrap">
                  {entry.content}
                </p>
              </div>
            ))
          ) : (
            <div className="py-20 text-center flex flex-col items-center gap-4">
              <div className="p-4 bg-slate-50 rounded-full">
                <CalendarIcon className="w-8 h-8 text-slate-200" />
              </div>
              <p className="text-slate-300 text-sm font-light italic">{t('noResults')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

