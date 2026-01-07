'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Mic, ArrowUp } from 'lucide-react';
import { useDiaryStore, Category } from '@/store/useDiaryStore';
import { formatLocalDate, formatLocalTime } from '@/lib/date-utils';

// 扩展 Window 接口以支持 Web Speech API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

const CATEGORY_KEYWORDS: Record<Exclude<Category, 'NORMAL'>, string[]> = {
  TODO: ['todo', 'buy', 'task', 'complete', 'need to'],
  DREAM: ['dream', 'future', 'wish', 'vision', 'expect'],
  BEAUTIFUL: ['beautiful', 'happy', 'joy', 'sunshine', 'enjoy'],
  REFLECTION: ['reflect', 'mistake', 'lesson', 'improve', 'regret'],
  GRATITUDE: ['grateful', 'thanks', 'thank', 'blessed']
};

export default function InputArea() {
  const t = useTranslations('Index');
  const locale = useLocale();
  const [inputValue, setInputValue] = useState('');
  const { 
    addEntry, 
    updateEntry,
    isSttActive, setIsSttActive,
    sttText, setSttText 
  } = useDiaryStore();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);
  const finalTranscriptRef = useRef<string>('');

  const autoTag = (text: string): Category => {
    for (const [key, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
      if (keywords.some(k => text.toLowerCase().includes(k))) return key as Category;
    }
    return 'NORMAL';
  };

  const startSTT = () => {
    // Check if browser supports Web Speech API
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert(t('sttNotSupported'));
      setIsSttActive(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    finalTranscriptRef.current = '';

    // Configure recognition parameters
    recognition.lang = locale === 'zh' ? 'zh-CN' : 'en-US'; // Speech recognition language
    recognition.continuous = true; // Continuous recognition
    recognition.interimResults = true; // Return interim results

    recognition.onstart = () => {
      console.log('语音识别已开始');
      setSttText('');
      finalTranscriptRef.current = '';
    };

    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      // 累加最终结果，显示中间结果
      if (finalTranscript) {
        finalTranscriptRef.current += finalTranscript;
      }

      // 更新显示：已确认的文本 + 当前中间结果
      setSttText(finalTranscriptRef.current + interimTranscript);
    };

    recognition.onerror = (event: any) => {
      console.error('语音识别错误:', event.error);
      if (event.error === 'no-speech') {
        setSttText(t('sttNoSpeech'));
      } else if (event.error === 'network') {
        setSttText(t('sttNetwork'));
      } else if (event.error === 'not-allowed') {
        setSttText(t('sttNotAllowed'));
      } else {
        setSttText(t('sttError', { error: event.error }));
      }
      setIsSttActive(false);
    };

    recognition.onend = () => {
      console.log('Speech recognition ended');
      // If the user hasn't manually stopped, it might be a timeout, can choose to auto-restart
      // Here we let the user control it manually
    };

    try {
      recognition.start();
    } catch (err) {
      console.error('Failed to start speech recognition:', err);
      setSttText(t('sttError', { error: 'Failed to start' }));
      setIsSttActive(false);
    }
  };

  const stopSTT = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (err) {
        // 忽略停止时的错误
      }
      recognitionRef.current = null;
    }
  };

  useEffect(() => {
    if (isSttActive) {
      startSTT();
    } else {
      stopSTT();
    }
    return () => stopSTT();
  }, [isSttActive]);

  const handleSend = async (text = inputValue) => {
    const targetText = text.trim();
    if (!targetText) return;

    const now = new Date();
    const entryId = Date.now().toString();
    
    // 先使用关键词匹配作为默认分类
    const defaultCategory = autoTag(targetText);
    
    const newEntry = {
      id: entryId,
      content: targetText,
      time: formatLocalTime(now),
      date: formatLocalDate(now),
      category: defaultCategory,
      completed: targetText.toLowerCase().includes('todo') || targetText.includes('待办') ? false : undefined
    };

    // 先保存日记（使用默认分类）
    addEntry(newEntry);
    setInputValue('');

    // 异步调用 AI 分类并更新
    try {
      const res = await fetch('/api/categorize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: targetText })
      });
      const data = await res.json();
      if (data.category && data.category !== defaultCategory) {
        // 如果 AI 分类结果不同，更新分类
        updateEntry(entryId, { category: data.category as Category });
      }
    } catch (err) {
      console.error('Failed to categorize:', err);
      // 分类失败不影响日记保存
    }
  };

  const handleConfirmStt = () => {
    setInputValue(sttText);
    setIsSttActive(false);
    setSttText('');
    finalTranscriptRef.current = '';
  };

  useEffect(() => {
    // 移除自动聚焦逻辑，以避免主动触发键盘
    // if (!isSttActive && inputRef.current) {
    //   inputRef.current.focus();
    // }
  }, [isSttActive]);

  return (
    <div className="w-full flex justify-center py-6 px-4">
      {!isSttActive ? (
        <div className={`
          w-full max-w-2xl glass rounded-[2rem] border transition-all duration-500 flex flex-col p-2 gap-2
          ${inputValue ? 'border-slate-300 shadow-[0_20px_50px_rgba(0,0,0,0.1)] scale-[1.02] bg-white ring-4 ring-slate-50' : 'border-slate-200/60 shadow-xl bg-white/50'}
        `}>
          <textarea 
            ref={inputRef}
            rows={1}
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              // Auto-resize textarea
              if (inputRef.current) {
                inputRef.current.style.height = 'auto';
                inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
              }
            }}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
            placeholder={t('placeholder')}
            className="flex-1 bg-transparent border-none focus:outline-none px-6 py-5 text-lg font-light leading-relaxed resize-none hide-scrollbar min-h-[80px] max-h-60 text-slate-700 placeholder:text-slate-300 transition-all"
          />
          <div className="flex justify-between items-center px-4 pb-2">
            <div className="flex items-center gap-1">
              <span className={`text-[10px] font-medium tracking-widest uppercase transition-opacity duration-300 ${inputValue ? 'text-slate-400 opacity-100' : 'opacity-0'}`}>
                {inputValue.length} characters
              </span>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => setIsSttActive(true)}
                className="p-3 rounded-full text-slate-400 hover:bg-slate-100 hover:text-blue-500 transition-all active:scale-90"
                title="Voice Input"
              >
                <Mic className="w-5 h-5" />
              </button>
              <button 
                onClick={() => handleSend()}
                disabled={!inputValue.trim()}
                className={`
                  p-3 rounded-full transition-all duration-300 active:scale-90
                  ${inputValue.trim() ? 'bg-slate-800 text-white shadow-lg rotate-0' : 'bg-slate-50 text-slate-200 cursor-not-allowed'}
                `}
              >
                <ArrowUp className={`w-5 h-5 transition-transform duration-300 ${inputValue.trim() ? 'translate-y-0' : 'translate-y-1 opacity-50'}`} />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="w-full max-w-2xl glass rounded-[2.5rem] border border-blue-100 shadow-2xl p-10 flex flex-col gap-8 animate-in zoom-in-95 duration-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-4 h-4 bg-blue-500 rounded-full pulse" />
                <div className="absolute inset-0 w-4 h-4 bg-blue-400 rounded-full animate-ping opacity-75" />
              </div>
              <span className="text-sm font-black text-blue-500 tracking-[0.3em] uppercase">{t('listening')}</span>
            </div>
            <button 
              onClick={() => {
                setIsSttActive(false);
                setSttText('');
                finalTranscriptRef.current = '';
              }}
              className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-all"
            >
              {t('cancel')}
            </button>
          </div>
          
          <div className="min-h-[120px] flex items-center justify-center text-center px-4">
            <p className="text-2xl font-light text-slate-700 font-serif leading-relaxed italic">
              {sttText || t('sttInitial')}
            </p>
          </div>

          <div className="flex justify-center mt-4">
            <button 
              onClick={handleConfirmStt}
              disabled={!sttText}
              className={`
                px-16 py-4 rounded-full text-base font-bold transition-all active:scale-95
                ${sttText ? 'bg-blue-600 text-white shadow-xl shadow-blue-100' : 'bg-slate-100 text-slate-300 cursor-not-allowed'}
              `}
            >
              {t('sttFinish')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
