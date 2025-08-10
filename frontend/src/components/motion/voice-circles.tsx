'use client';

import { useEffect, useMemo, useState } from 'react';
import { circles, type CircleConfig } from '@/components/ui/animated-circles';
import { Progress } from '@/components/ui/progress';

const VoiceReactiveCircle = ({
  circle,
  time,
  volume,
  isRecording,
}: {
  circle: CircleConfig;
  time: number;
  volume: number;
  isRecording: boolean;
}) => {
  const transform = useMemo(() => {
    const orbitMultiplier = 1 + volume * 0.1;
    const scaleMultiplier = 1 + volume * 1.1;

    const idleOffset = isRecording ? 0 : Math.sin(time * 0.5) * 2;

    const x = Math.sin(time * circle.speed) * circle.horizontalRange * orbitMultiplier + idleOffset;
    const y = Math.cos(time * circle.speed) * circle.verticalRange * orbitMultiplier + idleOffset;
    const scale = Math.max(0.4, 1 + Math.cos(time * circle.speed) * 0.4 * scaleMultiplier);

    return `translate(-50%, -50%) translate(${x}px, ${y}px) scale(${scale})`;
  }, [circle, time, volume, isRecording]);

  return (
    <div
      className={`${circle.className} absolute`}
      style={{
        left: '50%',
        top: '50%',
        transform,
        filter: `brightness(${1 + volume * 0.2}) saturate(${1 + volume * 0.1})`,
      }}
    />
  );
};

export default function VoiceReactiveCircles({
  size = 300,
  isRecording = false,
  onToggleRecording,
  isSaving = false,
  interactive = true,
  agentSpeaking = false,
  isConnecting = false,
  context = 'talk',
}: {
  size?: number;
  isRecording?: boolean;
  onToggleRecording?: () => void;
  isSaving?: boolean;
  interactive?: boolean;
  agentSpeaking?: boolean;
  isConnecting?: boolean;
  context?: 'talk' | 'notes';
}) {
  const [time, setTime] = useState(0);
  const [volume, setVolume] = useState(0);
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const timeIncrement = isRecording ? 0.008 : 0.003;
      setTime((prev) => prev + timeIncrement);
    }, 8);
    return () => clearInterval(interval);
  }, [isRecording]);

  useEffect(() => {
    if (!isRecording) {
      setIsListening(false);
      setVolume(0);
      return;
    }

    let audioContext: AudioContext | null = null;
    let stream: MediaStream | null = null;
    let rafId: number;

    const setup = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioContext = new (window.AudioContext ||
          (window as typeof window & { webkitAudioContext?: typeof AudioContext })
            .webkitAudioContext)();

        const analyser = audioContext.createAnalyser();
        const mic = audioContext.createMediaStreamSource(stream);

        mic.connect(analyser);
        analyser.fftSize = 1024;
        analyser.smoothingTimeConstant = 0.3;
        analyser.minDecibels = -90;
        analyser.maxDecibels = -10;

        const bufferLength = analyser.frequencyBinCount;
        const data = new Uint8Array(bufferLength);
        let smoothed = 0;

        const tick = () => {
          analyser.getByteFrequencyData(data);
          const voiceRange = data.slice(0, Math.floor(bufferLength * 0.4));
          const avg = voiceRange.reduce((a, b) => a + b, 0) / voiceRange.length || 0;
          const normalized = avg / 255;

          smoothed = smoothed * 0.8 + normalized * 0.2;
          const threshold = 0.05;
          const amplified = Math.max(0, (smoothed - threshold) * 4);
          const finalVol = Math.min(1, amplified);

          setVolume(finalVol);
          rafId = requestAnimationFrame(tick);
        };

        rafId = requestAnimationFrame(tick);
        setIsListening(true);
      } catch (err) {
        console.log('Voice input not available:', err);
        setIsListening(false);
      }
    };
    setup();
    return () => {
      cancelAnimationFrame(rafId);
      if (audioContext) audioContext.close();
      if (stream) stream.getTracks().forEach((t) => t.stop());
    };
  }, [isRecording]);

  let statusText: string;
  let dotClass: string;

  if (context === 'talk') {
    statusText = isSaving
      ? 'Processing'
      : isConnecting
        ? 'Connecting…'
        : agentSpeaking
          ? 'Agent speaking'
          : isRecording && isListening
            ? 'Agent listening'
            : 'Inactive';

    dotClass = isSaving
      ? 'bg-blue-500'
      : isConnecting
        ? 'bg-amber-400'
        : agentSpeaking
          ? 'bg-yellow-500'
          : isRecording && isListening
            ? 'animate-pulse bg-green-500'
            : 'bg-gray-400';
  } else {
    const recording = isRecording && isListening && volume > 0;
    statusText = isSaving
      ? 'Saving…'
      : isConnecting
        ? 'Connecting…'
        : recording
          ? 'Recording'
          : isRecording
            ? 'Listening'
            : 'Inactive';

    dotClass = isSaving
      ? 'bg-blue-500'
      : isConnecting
        ? 'bg-amber-400'
        : recording
          ? 'animate-pulse bg-green-500'
          : isRecording
            ? 'bg-amber-400'
            : 'bg-gray-400';
  }

  return (
    <div className="flex flex-col items-center justify-center">
      <svg style={{ position: 'absolute', pointerEvents: 'none' }}>
        <defs>
          <filter id="voice-gooey">
            <feGaussianBlur stdDeviation="6" />
            <feColorMatrix values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 36 -18" />
          </filter>
        </defs>
      </svg>

      <div
        className={`relative ${interactive && !isSaving ? 'cursor-pointer' : ''}`}
        style={{
          filter: 'url(#voice-gooey)',
          width: `${size}px`,
          height: `${size}px`,
        }}
        onClick={interactive && !isSaving ? onToggleRecording : undefined}
      >
        {circles.map((circle) => (
          <VoiceReactiveCircle
            key={circle.id}
            circle={circle}
            time={time}
            volume={volume}
            isRecording={isRecording}
          />
        ))}
      </div>

      <div className="mb-2 text-center">
        <span className={`mr-2 inline-block h-2 w-2 rounded-full ${dotClass}`} />
        <span className="text-muted-foreground text-xs">{statusText}</span>
      </div>

      <div className="w-60">
        <Progress
          className="h-1.5 [&>div]:transition-[width] [&>div]:duration-200 [&>div]:ease-out"
          value={volume * 100}
        />
      </div>
    </div>
  );
}
