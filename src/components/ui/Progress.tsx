import * as React from 'react';
import * as ProgressPrimitive from '@radix-ui/react-progress';

interface ProgressProps extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  value: number;
  variant?: 'linear' | 'circular';
  className?: string;
}

export const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(({ className, value, variant = 'linear', ...props }, ref) => {
  const percentage = Math.min(Math.max(value, 0), 100);

  if (variant === 'circular') {
    const radius = 25;
    const strokeWidth = 6;
    const normalizedRadius = radius - strokeWidth / 2;
    const circumference = 2 * Math.PI * normalizedRadius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;
    const size = (radius + strokeWidth) * 2;

    return (
      <div className={`relative inline-flex items-center justify-center ${className}`}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          style={{ transform: 'rotate(-90deg)' }}
        >
          {/* Background circle */}
          <circle
            className="stroke-gray-200"
            fill="none"
            strokeWidth={strokeWidth}
            r={normalizedRadius}
            cx={size / 2}
            cy={size / 2}
          />
          {/* Progress circle */}
          <circle
            className="stroke-primary transition-all duration-300 ease-in-out"
            fill="none"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            r={normalizedRadius}
            cx={size / 2}
            cy={size / 2}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center bg-white bg-opacity-90 rounded-full p-2">
            <span className="text-xl font-bold text-primary">{percentage}%</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ProgressPrimitive.Root
      ref={ref}
      className={`relative h-2 w-full overflow-hidden rounded-full bg-gray-200 ${className}`}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className="h-full w-full flex-1 bg-primary transition-all"
        style={{ transform: `translateX(-${100 - percentage}%)` }}
      />
    </ProgressPrimitive.Root>
  );
});

Progress.displayName = 'Progress'; 