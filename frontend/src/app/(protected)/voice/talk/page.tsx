import { Conversation } from './conversation';
import { FadeUp } from '@/components/motion/fade-up';

export default function Home() {
  return (
    <div className="min-h-screen pt-60 pb-20">
      <div className="mx-auto max-w-4xl px-6">
        <FadeUp delay={0.1}>
          <div className="flex flex-col items-center space-y-6">
            <Conversation />
          </div>
        </FadeUp>
      </div>
    </div>
  );
}
