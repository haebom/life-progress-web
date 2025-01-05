'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/auth';
import { Firebase } from '@/lib/firebase';
import { InAppBrowserModal } from '@/components/InAppBrowserModal';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export function LoginButton() {
  const { 
    isLoading,
    error,
    isInAppBrowser,
    setInAppBrowser,
    isInitialized
  } = useAuthStore();

  useEffect(() => {
    if (!isInitialized) {
      Firebase.getGoogleRedirectResult();
    }
  }, [isInitialized]);

  const handleLogin = async () => {
    const result = await Firebase.signInWithGoogle();
    if (result.type === 'in_app_browser') {
      setInAppBrowser(true);
    }
  };

  if (!isInitialized) {
    return <LoadingSpinner />;
  }

  return (
    <div className="w-full max-w-sm space-y-2">
      <Button
        onClick={handleLogin}
        disabled={isLoading}
        className="w-full"
        variant="default"
      >
        {isLoading ? (
          <div className="flex items-center space-x-2">
            <LoadingSpinner size="sm" />
            <span>로그인 중...</span>
          </div>
        ) : (
          'Google로 로그인'
        )}
      </Button>
      
      {error && (
        <p className="text-sm text-red-500 text-center">{error}</p>
      )}
      
      <InAppBrowserModal
        open={isInAppBrowser}
        onOpenChange={setInAppBrowser}
      />
    </div>
  );
} 