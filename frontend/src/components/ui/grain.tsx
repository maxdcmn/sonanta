'use client';

import React from 'react';

interface GrainProps {
  opacity?: number;
  seed?: number;
  baseFrequency?: number;
}

export default function Grain({ opacity = 0.06, seed = 2, baseFrequency = 0.65 }: GrainProps) {
  return (
    <svg
      className={`h-full w-full mix-blend-soft-light aria-hidden style={{ pointerEvents: 'none' }}`}
    >
      <filter id="grain-filter" x="0" y="0" width="100%" height="100%">
        <feTurbulence
          type="fractalNoise"
          baseFrequency={baseFrequency}
          numOctaves="2"
          seed={seed}
          stitchTiles="stitch"
          result="noise"
        />
        <feColorMatrix in="noise" type="saturate" values="0" result="mono" />
        <feComponentTransfer in="mono">
          <feFuncA type="gamma" amplitude="1" exponent="1.2" offset="0" />
        </feComponentTransfer>
      </filter>
      <rect width="100%" height="100%" filter="url(#grain-filter)" opacity={opacity} />
    </svg>
  );
}
