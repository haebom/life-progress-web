'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LoginButton } from '@/components/LoginButton';
import { useAuthStore } from '@/store/auth';
import { useToast } from '@/hooks/use-toast';

export default function Home() {
  const router = useRouter();
  const { user, isLoading } = useAuthStore();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      toast({
        title: '환영합니다!',
        description: `${user.displayName}님, 다시 만나서 반갑습니다.`,
      });
      router.push('/dashboard');
    }
  }, [user, router, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight">Life Progress</h1>
          <p className="mt-3 text-lg text-muted-foreground">
            인생의 진행도를 시각화하고 목표를 관리하세요
          </p>
        </div>
        <div className="mt-8">
          <LoginButton />
        </div>
      </div>
    </main>
  );
}
