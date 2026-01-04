'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Mic, ArrowUp, Loader2 } from 'lucide-react';
import { useDiaryStore, Category } from '@/store/useDiaryStore';
import { floatTo16BitPCM, resample } from '@/lib/audio-utils';

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
    isSttActive, setIsSttActive,
    sttText, setSttText 
  } = useDiaryStore();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  
  const [isConnecting, setIsConnecting] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);

  const autoTag = (text: string): Category => {
    for (const [key, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
      if (keywords.some(k => text.toLowerCase().includes(k))) return key as Category;
    }
    return 'NORMAL';
  };

  const startSTT = async () => {
    try {
      setIsConnecting(true);
      setSttText('');
      
      // 1. 获取鉴权 URL
      const res = await fetch('/api/xfyun/auth');
      const { url } = await res.json();

      // 2. 建立 WebSocket
      const socket = new WebSocket(url);
      socketRef.current = socket;

      socket.onopen = async () => {
        console.log('XfYun WebSocket Connected');
        setIsConnecting(false);
        
        // 3. 开始录音
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        audioContextRef.current = audioContext;
        
        const source = audioContext.createMediaStreamSource(stream);
        const processor = audioContext.createScriptProcessor(4096, 1, 1);
        processorRef.current = processor;

        processor.onaudioprocess = (e) => {
          const inputData = e.inputBuffer.getChannelData(0);
          // 采样率转换并转为 16bit PCM
          const resampled = resample(inputData, audioContext.sampleRate, 16000);
          const pcmData = floatTo16BitPCM(resampled);
          
          if (socket.readyState === WebSocket.OPEN) {
            socket.send(pcmData);
          }
        };

        source.connect(processor);
        processor.connect(audioContext.destination);
      };

      socket.onmessage = (e) => {
        const response = JSON.parse(e.data);
        if (response.action === 'result') {
          try {
            const data = JSON.parse(response.data);
            const rt = data.cn.st.rt[0];
            const text = rt.ws.map((w: any) => w.cw[0].w).join('');
            
            // type "0" 是最终结果，type "1" 是中间结果
            if (data.cn.st.type === '0') {
              setSttText(prev => prev + text);
            } else {
              // 对于中间结果，我们只显示当前这段，不累加
              // 实际应用中可以根据 sid 或 pg 字段进行更精细的拼接
              setSttText(prev => {
                // 如果 prev 为空或上一句已结束，直接显示 text
                // 否则这里只是简单覆盖显示（演示逻辑）
                return prev.split('。').slice(0, -1).join('。') + (prev ? '。' : '') + text;
              });
            }
          } catch (err) {
            console.error('Parse result error:', err);
          }
        }
      };

      socket.onerror = (err) => {
        console.error('WebSocket Error:', err);
        stopSTT();
      };

      socket.onclose = () => {
        console.log('XfYun WebSocket Closed');
        setIsConnecting(false);
      };

    } catch (err) {
      console.error('Start STT error:', err);
      setIsConnecting(false);
      setIsSttActive(false);
    }
  };

  const stopSTT = () => {
    if (socketRef.current) {
      // 发送结束标识（可选，取决于具体接口要求，通常直接关闭即可）
      socketRef.current.close();
      socketRef.current = null;
    }
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    setIsConnecting(false);
  };

  useEffect(() => {
    if (isSttActive) {
      startSTT();
    } else {
      stopSTT();
    }
    return () => stopSTT();
  }, [isSttActive]);

  const handleSend = (text = inputValue) => {
    const targetText = text.trim();
    if (!targetText) return;

    const now = new Date();
    addEntry({
      id: Date.now().toString(),
      content: targetText,
      time: `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`,
      date: now.toISOString().split('T')[0],
      category: autoTag(targetText),
      completed: targetText.includes('待办') || targetText.includes('todo') ? false : undefined
    });

    setInputValue('');
  };

  const handleConfirmStt = () => {
    setInputValue(sttText);
    setIsSttActive(false);
    setSttText('');
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
              {isConnecting ? (
                <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
              ) : (
                <div className="w-3 h-3 bg-blue-500 rounded-full pulse" />
              )}
              <span className="text-xs font-bold text-blue-500 tracking-widest uppercase">
                {isConnecting ? '正在连接...' : t('listening')}
              </span>
            </div>
            <button 
              onClick={() => {
                setIsSttActive(false);
                setSttText('');
              }}
              className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
            >
              {t('cancel')}
            </button>
          </div>
          
          <div className="min-h-[60px] flex items-center justify-center text-center">
            <p className="text-lg font-light text-slate-700 font-serif leading-relaxed italic">
              {sttText || (isConnecting ? "准备中..." : "正在倾听...")}
            </p>
          </div>

          <div className="flex justify-center gap-4 mt-2">
            <button 
              onClick={handleConfirmStt}
              disabled={!sttText || isConnecting}
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

