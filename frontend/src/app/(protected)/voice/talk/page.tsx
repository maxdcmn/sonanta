import { Conversation } from './conversation';
import { FadeUp } from '@/components/motion/fade-up';

export default function Home() {
  return (
    <div className="min-h-screen pt-60 pb-20">
      <div className="mx-auto max-w-4xl px-6">
        <FadeUp delay={0.1}>
          <div className="flex flex-col items-center space-y-6">
            <div className="mb-4 text-center">
              <h2 className="mb-2 text-2xl font-semibold">Get guidance</h2>
            </div>
            <Conversation />
          </div>
        </FadeUp>
      </div>
    </div>
  );
}
