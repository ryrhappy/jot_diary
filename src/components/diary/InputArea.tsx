'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Mic, ArrowUp } from 'lucide-react';
import { useDiaryStore, Category } from '@/store/useDiaryStore';

// 扩展 Window 接口以支持 Web Speech API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

const CATEGORY_KEYWORDS: Record<Exclude<Category, 'NORMAL'>, string[]> = {
  TODO: ['待办', '要去', '完成', '任务', '买', 'todo', 'buy'],
  DREAM: ['梦想', '以后', '想成为', '愿景', '期待', 'dream', 'future'],
  BEAUTIFUL: ['美好', '开心', '快乐', '阳光', '享受', 'beautiful', 'happy'],
  REFLECTION: ['反思', '错误', '教训', '改进', '后悔', 'reflect', 'mistake'],
  GRATITUDE: ['感恩', '感谢', '幸好', '谢谢', 'grateful', 'thanks']
};

export default function InputArea() {
  const t = useTranslations('Index');
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
    // 检查浏览器是否支持 Web Speech API
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('您的浏览器不支持语音识别，请使用 Chrome 或 Edge 浏览器');
      setIsSttActive(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    finalTranscriptRef.current = '';

    // 配置识别参数
    recognition.lang = 'zh-CN'; // 中文识别
    recognition.continuous = true; // 连续识别
    recognition.interimResults = true; // 返回中间结果

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
        setSttText('未检测到语音，请重试');
      } else if (event.error === 'network') {
        setSttText('网络错误，请检查网络连接');
      } else if (event.error === 'not-allowed') {
        setSttText('麦克风权限被拒绝，请在浏览器设置中允许麦克风访问');
      } else {
        setSttText(`识别错误: ${event.error}`);
      }
      setIsSttActive(false);
    };

    recognition.onend = () => {
      console.log('语音识别已结束');
      // 如果用户没有手动停止，可能是识别超时，可以选择自动重启
      // 这里我们让用户手动控制
    };

    try {
      recognition.start();
    } catch (err) {
      console.error('启动语音识别失败:', err);
      setSttText('启动失败，请重试');
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
      time: `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`,
      date: now.toISOString().split('T')[0],
      category: defaultCategory,
      completed: targetText.includes('待办') || targetText.includes('todo') ? false : undefined
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
    if (!isSttActive && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isSttActive]);

  return (
    <footer className="fixed bottom-0 w-full z-40 flex justify-center p-8 px-4">
      {!isSttActive ? (
        <div className="w-full max-w-2xl glass rounded-[2.5rem] border border-slate-200/60 shadow-2xl flex items-end p-2 gap-2">
          <textarea 
            ref={inputRef}
            rows={1}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
            placeholder={t('placeholder')}
            className="flex-1 bg-transparent border-none focus:outline-none px-6 py-4 text-sm resize-none hide-scrollbar max-h-32 text-slate-700 placeholder:text-slate-200"
          />
          <div className="flex gap-2 p-2">
            <button 
              onClick={() => setIsSttActive(true)}
              className="p-3 rounded-full text-slate-400 hover:bg-slate-50 transition-all active:scale-90"
            >
              <Mic className="w-5 h-5" />
            </button>
            <button 
              onClick={() => handleSend()}
              className={`p-3 rounded-full transition-all active:scale-90 ${inputValue ? 'bg-slate-800 text-white shadow-lg' : 'bg-slate-50 text-slate-200 cursor-not-allowed'}`}
            >
              <ArrowUp className="w-5 h-5" />
            </button>
          </div>
        </div>
      ) : (
        <div className="w-full max-w-2xl glass rounded-[2.5rem] border border-blue-100 shadow-2xl p-6 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-blue-500 rounded-full pulse" />
              <span className="text-xs font-bold text-blue-500 tracking-widest uppercase">{t('listening')}</span>
            </div>
            <button 
              onClick={() => {
                setIsSttActive(false);
                setSttText('');
                finalTranscriptRef.current = '';
              }}
              className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
            >
              {t('cancel')}
            </button>
          </div>
          
          <div className="min-h-[60px] flex items-center justify-center text-center">
            <p className="text-lg font-light text-slate-700 font-serif leading-relaxed italic">
              {sttText || "正在倾听..."}
            </p>
          </div>

          <div className="flex justify-center gap-4 mt-2">
            <button 
              onClick={handleConfirmStt}
              disabled={!sttText}
              className={`px-10 py-3 rounded-full text-sm font-bold transition-all active:scale-95 ${sttText ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-100 text-slate-300 cursor-not-allowed'}`}
            >
              完成转文字
            </button>
          </div>
        </div>
      )}
    </footer>
  );
}
