'use client';

import { motion, useReducedMotion, type HTMLMotionProps } from 'framer-motion';
import type { ReactNode } from 'react';

interface FadeUpProps extends HTMLMotionProps<'div'> {
  children: ReactNode;
  delay?: number;
  useInView?: boolean;
  distance?: number;
}

export const FadeUp = ({
  children,
  delay = 0,
  useInView = false,
  distance = 12,
  className,
  ...rest
}: FadeUpProps) => {
  const initial = { opacity: 0, y: distance };
  const appear = { opacity: 1, y: 0 };
  const durationInView = 0.6;
  const durationNow = 0.4;

  if (useInView) {
    return (
      <motion.div
        initial={initial}
        whileInView={appear}
        transition={{ duration: durationInView, ease: 'easeOut', delay }}
        viewport={{ once: true, amount: 0.15 }}
        className={className}
        {...rest}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={initial}
      animate={appear}
      transition={{ duration: durationNow, ease: 'easeOut', delay }}
      className={className}
      {...rest}
    >
      {children}
    </motion.div>
  );
};
