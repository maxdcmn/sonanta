import { Logo } from '@/components/layout/logo';
import { FadeUp } from '@/components/motion/fade-up';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-background flex min-h-svh flex-col p-6">
      <div className="mb-8 flex items-center justify-between">
        <Logo />
        <div></div>
      </div>
      <FadeUp className="flex flex-1 flex-col items-center justify-center">
        <div className="w-full max-w-xs">{children}</div>
      </FadeUp>
    </div>
  );
}
