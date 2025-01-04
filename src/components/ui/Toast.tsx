'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import { useEffect, useState } from 'react';

const toastVariants = cva(
  'fixed bottom-4 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-lg shadow-lg transition-all duration-300',
  {
    variants: {
      variant: {
        default: 'bg-white text-gray-900',
        success: 'bg-green-500 text-white',
        error: 'bg-red-500 text-white',
        warning: 'bg-yellow-500 text-white',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

interface ToastProps extends VariantProps<typeof toastVariants> {
  message: string;
  duration?: number;
  onClose: () => void;
}

export function Toast({ message, duration = 3000, variant = 'default', onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // 애니메이션이 끝난 후 제거
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div
      className={`${toastVariants({ variant })} ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
      }`}
    >
      {message}
    </div>
  );
} 