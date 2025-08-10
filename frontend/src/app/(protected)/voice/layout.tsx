'use client';

import { ReactNode } from 'react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import Aurora from '@/components/ui/aurora';
import Grain from '@/components/ui/grain';

export default function VoiceLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <main className="relative min-h-screen overflow-x-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <Aurora
            colorStops={['#7bfb63', '#b19eef', '#5227ff']}
            blend={1}
            amplitude={0.6}
            speed={0.6}
          />
          <div className="absolute inset-0">
            <Grain opacity={0.1} baseFrequency={0.8} />
          </div>
        </div>
        <div className="relative">{children}</div>
      </main>
    </>
  );
}
