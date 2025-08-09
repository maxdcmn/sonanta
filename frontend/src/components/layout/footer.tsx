'use client';

import Link from 'next/link';
import { FadeUp } from '@/components/motion/fade-up';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-foreground text-background relative overflow-hidden">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid grid-cols-4 gap-10">
          <FadeUp className="col-span-2" delay={0.1} useInView>
            <div className="flex flex-col items-start gap-2">
              <span className="text-background font-mono text-lg font-medium tracking-tight">
                sonanta
              </span>
              <p className="text-muted-foreground text-sm">A product by students enjoying AI.</p>

              <div className="mt-2">
                <Button asChild variant="secondary" className="dark">
                  <Link href="/signup">
                    Get started
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </FadeUp>

          <FadeUp delay={0.2} useInView>
            <h3 className="text-background mb-3 font-medium">Product</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link className="text-muted-foreground hover:text-background" href="/login">
                  Login
                </Link>
              </li>
              <li>
                <Link className="text-muted-foreground hover:text-background" href="/signup">
                  Sign Up
                </Link>
              </li>
            </ul>
          </FadeUp>

          <FadeUp delay={0.3} useInView>
            <h3 className="text-background mb-3 font-medium">Company</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link className="text-muted-foreground hover:text-background" href="/">
                  About
                </Link>
              </li>
              <li>
                <Link className="text-muted-foreground hover:text-background" href="/">
                  Contact
                </Link>
              </li>
            </ul>
          </FadeUp>
        </div>

        <div className="border-muted-foreground/20 mt-8 flex flex-col items-center gap-4 border-t pt-6 md:flex-row md:justify-between">
          <p className="text-muted-foreground text-xs">&copy; {year} sonanta</p>
        </div>
      </div>
    </footer>
  );
}
