'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useStore from '@/store/useStore';
import InitialSetupModal from '@/components/InitialSetupModal';

export default function SignupPage() {
  const router = useRouter();
  const { user } = useStore();
  const [showSetupModal, setShowSetupModal] = useState(false);

  useEffect(() => {
    // 이미 로그인된 사용자 처리
    if (user) {
      if (!user.birthDate) {
        // 초기 설정이 필요한 경우
        setShowSetupModal(true);
      } else {
        // 이미 설정이 완료된 경우
        router.push('/dashboard');
      }
    }
  }, [user, router]);

  const handleSetupComplete = () => {
    setShowSetupModal(false);
    router.push('/dashboard');
  };

  // 로그인되지 않은 상태에서만 회원가입 UI 표시
  if (user && !user.birthDate) {
    return (
      <InitialSetupModal
        user={user}
        isOpen={showSetupModal}
        onComplete={handleSetupComplete}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            회원가입
          </h1>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
            Life Progress에 오신 것을 환영합니다
          </p>
          <div className="mt-8">
            <button
              onClick={() => router.push('/login')}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Google로 시작하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 