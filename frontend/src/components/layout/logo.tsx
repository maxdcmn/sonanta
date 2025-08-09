import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AnimatedCircles } from '@/components/ui/animated-circles';

export function Logo() {
  return (
    <Button variant="ghost" asChild className="flex items-center gap-2">
      <Link href="/">
        <div className="scale-[0.1]">
          <AnimatedCircles size={20} />
        </div>
      </Link>
    </Button>
  );
}
