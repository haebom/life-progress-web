'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Firebase } from '@/lib/firebase';

export default function LoginButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showInAppBrowserModal, setShowInAppBrowserModal] = useState(false);

  const handleLogin = async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (Firebase.isInAppBrowser()) {
        setShowInAppBrowserModal(true);
        setIsLoading(false);
        return;
      }

      const result = await Firebase.signInWithGoogle();
      if (result?.user) {
        router.push('/dashboard');
      }
    } catch (err) {
      console.error('로그인 실패:', err);
      setError('로그인 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  if (showInAppBrowserModal) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-sm w-full">
          <h3 className="text-lg font-semibold mb-2">외부 브라우저로 이동</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            보안을 위해 Safari나 Chrome 브라우저에서 로그인해주세요.
          </p>
          <button
            onClick={() => window.location.href = window.location.href}
            className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
          >
            브라우저에서 열기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <button
        onClick={handleLogin}
        disabled={isLoading}
        className={`
          w-full px-4 py-2 flex items-center justify-center gap-2 
          bg-white dark:bg-gray-800 text-gray-800 dark:text-white
          border border-gray-300 dark:border-gray-600 rounded-lg
          hover:bg-gray-50 dark:hover:bg-gray-700
          transition-colors duration-200
          ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <Image
          src="/google-icon.svg"
          alt="Google"
          width={20}
          height={20}
          className="w-5 h-5"
        />
        {isLoading ? '로그인 중...' : 'Google로 계속하기'}
      </button>
      
      {error && (
        <p className="text-red-500 dark:text-red-400 text-sm text-center">
          {error}
        </p>
      )}
      
      {Firebase.isSafariBrowser() && (
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
          Safari에서는 팝업이 차단될 수 있습니다.
          차단된 경우 &quot;팝업 허용&quot;을 선택해주세요.
        </p>
      )}
    </div>
  );
} 