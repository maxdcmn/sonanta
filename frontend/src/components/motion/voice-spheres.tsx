'use client';

import { useEffect, useMemo, useState } from 'react';
import { circles, type CircleConfig } from '@/components/ui/animated-circles';
import { Progress } from '@/components/ui/progress';

const VoiceReactiveSphere = ({
  sphere,
  time,
  volume,
}: {
  sphere: CircleConfig;
  time: number;
  volume: number;
}) => {
  const transform = useMemo(() => {
    const orbitMultiplier = 1 + volume * 0.1;
    const scaleMultiplier = 1 + volume * 1.1;

    const x = Math.sin(time * sphere.speed) * sphere.horizontalRange * orbitMultiplier;
    const y = Math.cos(time * sphere.speed) * sphere.verticalRange * orbitMultiplier;
    const scale = Math.max(0.4, 1 + Math.cos(time * sphere.speed) * 0.4 * scaleMultiplier);

    return `translate(-50%, -50%) translate(${x}px, ${y}px) scale(${scale})`;
  }, [sphere, time, volume]);

  return (
    <div
      className={`${sphere.className} absolute`}
      style={{
        left: '50%',
        top: '50%',
        transform,
        filter: `brightness(${1 + volume * 0.2}) saturate(${1 + volume * 0.1})`,
      }}
    />
  );
};

export default function VoiceReactiveSpheres({ size = 300 }: { size?: number }) {
  const [time, setTime] = useState(0);
  const [volume, setVolume] = useState(0);
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setTime((prev) => prev + 0.008);
    }, 8);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
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
  }, []);

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <svg style={{ position: 'absolute', pointerEvents: 'none' }}>
        <defs>
          <filter id="voice-gooey">
            <feGaussianBlur stdDeviation="6" />
            <feColorMatrix values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 36 -18" />
          </filter>
        </defs>
      </svg>

      <div
        className="relative"
        style={{
          filter: 'url(#voice-gooey)',
          width: `${size}px`,
          height: `${size}px`,
        }}
      >
        {circles.map((sphere) => (
          <VoiceReactiveSphere key={sphere.id} sphere={sphere} time={time} volume={volume} />
        ))}
      </div>
      <div className="mb-4 text-center">
        <span
          className={`mr-2 inline-block h-3 w-3 rounded-full ${
            isListening ? 'animate-pulse bg-green-500' : 'bg-red-500'
          }`}
        />
        <span className="text-muted-foreground text-sm">
          {isListening ? 'Listening…' : 'Microphone not available'}
        </span>
      </div>

      <div className="w-50">
        <Progress
          className="[&>div]:transition-[width] [&>div]:duration-200 [&>div]:ease-out"
          value={volume * 100}
        />
      </div>
    </div>
  );
}
