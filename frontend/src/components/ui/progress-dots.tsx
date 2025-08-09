import * as React from 'react';
import { cn } from '@/lib/utils';

interface ProgressDotsProps extends React.HTMLAttributes<HTMLDivElement> {
  currentStep: number;
  totalSteps: number;
}

function ProgressDots({ className, currentStep, totalSteps, ...props }: ProgressDotsProps) {
  return (
    <div className={cn('flex items-center justify-center gap-2', className)} {...props}>
      {Array.from({ length: totalSteps }, (_, index) => (
        <div
          key={index}
          className={cn(
            'border-input flex size-3 items-center justify-center rounded-md border-1',
            index === currentStep - 1 &&
              "after:bg-input after:size-2 after:rounded-md after:content-['']",
          )}
        />
      ))}
    </div>
  );
}

export { ProgressDots };
