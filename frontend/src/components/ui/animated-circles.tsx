'use client';

import { useEffect, useRef } from 'react';

export type CircleConfig = {
  id: string;
  className: string;
  speed: number;
  horizontalRange: number;
  verticalRange: number;
};

export const circles: CircleConfig[] = [
  {
    id: 'one',
    className: 'w-20 h-20 rounded-full bg-foreground',
    speed: 0.8,
    horizontalRange: 60,
    verticalRange: 20,
  },
  {
    id: 'two',
    className: 'w-24 h-24 rounded-full bg-foreground',
    speed: 1.0,
    horizontalRange: 40,
    verticalRange: 40,
  },
  {
    id: 'three',
    className: 'w-24 h-24 rounded-full bg-foreground',
    speed: -0.4,
    horizontalRange: 60,
    verticalRange: -30,
  },
  {
    id: 'four',
    className: 'w-20 h-20 rounded-full bg-foreground',
    speed: -0.8,
    horizontalRange: 50,
    verticalRange: 70,
  },
];

export function AnimatedCircles({ size = 160 }: { size?: number }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let animationId: number;
    const start = performance.now();

    const update = (now: number) => {
      const t = (now - start) / 1000;
      const elems = containerRef.current?.children;
      if (elems) {
        for (let i = 0; i < elems.length; i++) {
          const cfg = circles[i];
          const el = elems[i] as HTMLElement;
          const x = Math.sin(t * cfg.speed) * cfg.horizontalRange;
          const y = Math.cos(t * cfg.speed) * cfg.verticalRange;
          const scale = Math.max(0.4, 1 + Math.cos(t * cfg.speed) * 0.4);
          el.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px) scale(${scale})`;
        }
      }
      animationId = requestAnimationFrame(update);
    };

    animationId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animationId);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center">
      <svg className="pointer-events-none absolute">
        <defs>
          <filter id="gooey-circles">
            <feGaussianBlur stdDeviation="6" />
            <feColorMatrix values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 72 -36" />
          </filter>
        </defs>
      </svg>

      <div
        ref={containerRef}
        className="relative"
        style={{
          filter: 'url(#gooey-circles)',
          width: `${size}px`,
          height: `${size}px`,
        }}
      >
        {circles.map((cfg) => (
          <div
            key={cfg.id}
            className={`${cfg.className} absolute`}
            style={{
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
            }}
          />
        ))}
      </div>
    </div>
  );
}
