'use client';

import { useEffect, useState } from 'react';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { AnimatedCircles } from '@/components/ui/animated-circles';
import { Button } from '@/components/ui/button';
import { ArrowRight, MessageSquare, Sparkles, BookOpen } from 'lucide-react';
import Aurora from '@/components/ui/aurora';
import Grain from '@/components/ui/grain';
import Link from 'next/link';
import { FadeUp } from '@/components/motion/fade-up';
import { Card } from '@/components/ui/card';

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
    <div className="min-h-screen">
      <div className="relative min-h-screen overflow-x-hidden">
        <Header />
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
        <main className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col items-center px-10 pt-60 md:pt-70">
          <div className="grid w-full items-center gap-10 md:grid-cols-2">
            <div className="flex flex-col items-center text-center md:items-start md:text-left">
              <motion.h1
                className="text-foreground/80 pb-2 font-mono text-xl leading-tight"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1 }}
              >
                sonanta
              </motion.h1>
              <motion.h1
                className="text-foreground/80 text-5xl font-semibold"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                Think out loud
              </motion.h1>
              <motion.h1
                className="text-foreground/80 text-5xl font-semibold"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                & leave with the idea
              </motion.h1>
              <motion.p
                className="text-muted-foreground mt-4 max-w-xl text-base"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.45 }}
              >
                Capture what you&apos;re exploring, then chat with an AI to unpack ideas, map topics
                and learn faster.
              </motion.p>

              <motion.div
                className="mt-6 flex flex-col items-center gap-3 md:flex-row"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                <Button className="gap-2" asChild>
                  <Link href="/signup">
                    Get Started
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </motion.div>
            </div>

            <motion.div
              className="relative mx-auto"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.35 }}
              style={{ x, y }}
              onAnimationComplete={() => setReady(true)}
            >
              <div className="relative">
                <AnimatedCircles size={320} />
              </div>
            </motion.div>
          </div>

          <section className="mt-10 w-full py-10">
            <div className="grid gap-6 md:grid-cols-3">
              <FadeUp useInView delay={0.05}>
                <Card className="bg-background/30 gap-1 p-6">
                  <div className="bg-foreground/5 mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg">
                    <MessageSquare className="h-4 w-4" />
                  </div>
                  <h3 className="mb-1 text-lg font-medium">Share your thoughts</h3>
                  <p className="text-muted-foreground text-sm">
                    Drop a quick thought about anything you&apos;re exploring or are passionate
                    about.
                  </p>
                </Card>
              </FadeUp>

              <FadeUp useInView delay={0.1}>
                <Card className="bg-background/30 gap-1 p-6">
                  <div className="bg-foreground/5 mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <h3 className="mb-1 text-lg font-medium">Learn by conversation</h3>
                  <p className="text-muted-foreground text-sm">
                    Get follow‑ups, examples and explanations tailored to what you said.
                  </p>
                </Card>
              </FadeUp>

              <FadeUp useInView delay={0.15}>
                <Card className="bg-background/30 gap-1 p-6">
                  <div className="bg-foreground/5 mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg">
                    <BookOpen className="h-4 w-4" />
                  </div>
                  <h3 className="mb-1 text-lg font-medium">Map your topics</h3>
                  <p className="text-muted-foreground text-sm">
                    See how ideas connect over time and build a personal knowledge map.
                  </p>
                </Card>
              </FadeUp>
            </div>
          </section>
        </main>
      </div>
      <Footer />
    </div>
  );
}
