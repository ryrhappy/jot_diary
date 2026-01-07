'use client';

import { useEffect, useRef } from 'react';

interface AudioVisualizerProps {
  isActive: boolean;
}

/**
 * 音频可视化组件
 * @param {AudioVisualizerProps} props
 */
export default function AudioVisualizer({ isActive }: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (isActive) {
      startVisualizing();
    } else {
      stopVisualizing();
    }

    return () => stopVisualizing();
  }, [isActive]);

  const startVisualizing = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;

      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;

      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);

      draw();
    } catch (err) {
      console.error('Error accessing microphone:', err);
    }
  };

  const stopVisualizing = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    
    // Clear canvas
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
  };

  const draw = () => {
    const canvas = canvasRef.current;
    const analyser = analyserRef.current;
    if (!canvas || !analyser) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas resolution to match display size
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const renderFrame = () => {
      animationFrameRef.current = requestAnimationFrame(renderFrame);
      analyser.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, rect.width, rect.height);
      
      const barCount = 40;
      const barSpacing = 4;
      const totalSpacing = (barCount - 1) * barSpacing;
      const barWidth = (rect.width - totalSpacing) / barCount;
      
      for (let i = 0; i < barCount; i++) {
        // Map bar index to frequency data (focusing more on lower/middle frequencies)
        const dataIndex = Math.floor((i / barCount) * (bufferLength * 0.6));
        const value = dataArray[dataIndex];
        
        // Calculate height (minimum 4px for aesthetic)
        const minHeight = 4;
        const maxHeight = rect.height * 0.8;
        const barHeight = Math.max(minHeight, (value / 255) * maxHeight);
        
        const x = i * (barWidth + barSpacing);
        const y = (rect.height - barHeight) / 2;
        
        // Color based on height
        const opacity = 0.3 + (value / 255) * 0.7;
        ctx.fillStyle = `rgba(59, 130, 246, ${opacity})`;
        
        // Draw rounded bar
        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(x, y, barWidth, barHeight, barWidth / 2);
        } else {
          ctx.rect(x, y, barWidth, barHeight);
        }
        ctx.fill();
      }
    };

    renderFrame();
  };

  return (
    <div className="w-full h-20 flex items-center justify-center">
      <canvas 
        ref={canvasRef} 
        className="w-full h-full max-w-md opacity-80"
      />
    </div>
  );
}

