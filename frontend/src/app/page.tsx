'use client';

import { useEffect, useState } from 'react';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { AnimatedCircles } from '@/components/ui/animated-circles';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

function useParallax(enabled: boolean) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springX = useSpring(mouseX, { stiffness: 120, damping: 35 });
  const springY = useSpring(mouseY, { stiffness: 120, damping: 35 });

  const x = useTransform(springX, (v) => v * 0.05);
  const y = useTransform(springY, (v) => v * 0.05);

  useEffect(() => {
    if (!enabled) return;

    const handle = (e: MouseEvent) => {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      mouseX.set(e.clientX - cx);
      mouseY.set(e.clientY - cy);
    };

    window.addEventListener('mousemove', handle);
    return () => window.removeEventListener('mousemove', handle);
  }, [enabled]);

  return { x, y };
}

export default function Home() {
  const [ready, setReady] = useState(false);
  const { x, y } = useParallax(ready);

  return (
    <div className="bg-background min-h-screen">
      <div className="relative min-h-screen overflow-x-hidden">
        <Header />

        <main className="relative flex h-screen flex-col items-center justify-center gap-2">
          <motion.h1
            className="text-center text-2xl font-light"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            Sonanta
          </motion.h1>
          <motion.p
            className="text-muted-foreground text-center text-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            Think out loud.
          </motion.p>

          <motion.div
            className="relative"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            style={{ x, y }}
            onAnimationComplete={() => setReady(true)}
          >
            <AnimatedCircles size={300} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.2 }}
          >
            <Button variant="ghost" className="gap-2 font-normal" asChild>
              <Link href="/login">
                Get Started
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </motion.div>
        </main>
      </div>
      <Footer />
    </div>
  );
}
