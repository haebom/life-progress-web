'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/auth';
import { Firebase } from '@/lib/firebase';
import { InAppBrowserModal } from '@/components/InAppBrowserModal';

export function LoginButton() {
  const { 
    isLoading,
    error,
    isInAppBrowser,
    setInAppBrowser,
    isInitialized,
    setError
  } = useAuthStore();

  useEffect(() => {
    const handleRedirectResult = async () => {
      try {
        if (!isInitialized) {
          const result = await Firebase.getGoogleRedirectResult();
          if (result.type === 'error' && result.message) {
            setError(result.message);
          }
        }
      } catch (error) {
        console.error('Redirect result error:', error);
        setError('로그인 처리 중 오류가 발생했습니다.');
      }
    };

    handleRedirectResult();
  }, [isInitialized, setError]);

  const handleLogin = async () => {
    try {
      setError('');
      const result = await Firebase.signInWithGoogle();
      if (result.type === 'in_app_browser') {
        setInAppBrowser(true);
      } else if (result.type === 'error' && result.message) {
        setError(result.message);
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('로그인 중 오류가 발생했습니다.');
    }
  };

  if (!isInitialized) {
    return (
      <div className="flex justify-center items-center min-h-[40px]">
        <Button variant="ghost" size="sm" disabled>
          초기화 중...
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm space-y-2 animate-in">
      <Button
        onClick={handleLogin}
        isLoading={isLoading}
        disabled={isLoading}
        className="w-full"
        variant="default"
        size="lg"
      >
        {isLoading ? '로그인 중...' : 'Google로 로그인'}
      </Button>
      
      {error && (
        <p className="text-sm text-destructive text-center animate-in">{error}</p>
      )}
      
      <InAppBrowserModal
        open={isInAppBrowser}
        onOpenChange={setInAppBrowser}
      />
    </div>
  );
} 