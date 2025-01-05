'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { initPushNotifications, removePushNotificationListeners } from '@/lib/pushNotifications';
import { BottomNavigation } from '@/components/BottomNavigation';
import { Firebase } from '@/lib/firebase';
import useStore from '@/store/useStore';

const PUBLIC_ROUTES = ['/login', '/signup', '/forgot-password'];

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, setUser } = useStore();
  const [isLoading, setIsLoading] = useState(true);

  // 인증 상태 감지 및 기본 라우팅
  useEffect(() => {
    const unsubscribe = Firebase.initializeAuth(async (firebaseUser) => {
      try {
        setIsLoading(true);
        
        if (firebaseUser) {
          // 사용자가 로그인한 경우
          const userData = await Firebase.fetchUserData(firebaseUser.uid);
          setUser(userData);
          
          // 로그인 페이지에 있다면 대시보드로 이동
          if (PUBLIC_ROUTES.includes(pathname)) {
            router.replace('/dashboard');
          }
        } else {
          // 로그아웃 상태
          setUser(null);
          
          // 보호된 경로에 있다면 로그인 페이지로 이동
          if (!PUBLIC_ROUTES.includes(pathname)) {
            router.replace('/login');
          }
        }
      } catch (error) {
        console.error('인증 상태 처리 오류:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, [pathname, router, setUser]);

  // 푸시 알림 초기화
  useEffect(() => {
    initPushNotifications();
    return () => {
      removePushNotificationListeners();
    };
  }, []);

  // 사용자 상태에 따른 UI 렌더링
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 flex items-center justify-center z-50">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
            <p className="text-sm text-gray-600 dark:text-gray-300">
              로딩 중...
            </p>
          </div>
        </div>
      );
    }

    // 공개 경로이거나 인증된 사용자인 경우 컨텐츠 표시
    if (PUBLIC_ROUTES.includes(pathname) || user) {
      return children;
    }

    // 그 외의 경우 로딩 표시
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-600 dark:text-gray-300">
          인증이 필요합니다...
        </p>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 relative">
        {renderContent()}
      </main>
      <BottomNavigation />
    </div>
  );
} 