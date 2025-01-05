'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { initPushNotifications, removePushNotificationListeners } from '@/lib/pushNotifications';
import { BottomNavigation } from '@/components/BottomNavigation';
import { Firebase } from '@/lib/firebase';
import useStore from '@/store/useStore';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, setUser } = useStore();
  const [isInitialized, setIsInitialized] = useState(false);
  const [isAuthChecked, setIsAuthChecked] = useState(false);

  useEffect(() => {
    initPushNotifications();
    return () => {
      removePushNotificationListeners();
    };
  }, []);

  // 인증 상태 변경 감지
  useEffect(() => {
    let isMounted = true;

    const unsubscribe = Firebase.initializeAuth(async (firebaseUser) => {
      console.log('Auth State Changed:', {
        firebaseUser: firebaseUser?.email,
        pathname,
        isInitialized,
        isAuthChecked
      });

      if (!isMounted) return;

      if (firebaseUser) {
        try {
          const userData = await Firebase.fetchUserData(firebaseUser.uid);
          console.log('User Data Fetched:', {
            userData: userData?.email,
            pathname,
            isInitialized
          });

          if (!isMounted) return;

          if (userData) {
            setUser(userData);
          } else {
            setUser(null);
          }
        } catch (error) {
          console.error('사용자 데이터 로딩 오류:', error);
          setUser(null);
        }
      } else {
        setUser(null);
      }

      if (!isAuthChecked) {
        setIsAuthChecked(true);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [setUser, pathname, isInitialized, isAuthChecked]);

  // 라우팅 처리
  useEffect(() => {
    if (!isAuthChecked) return;

    console.log('Routing Check:', {
      user: user?.email,
      pathname,
      isAuthChecked,
      isInitialized
    });

    const handleRouting = async () => {
      if (!isInitialized) {
        setIsInitialized(true);
        return;
      }

      if (user) {
        if (pathname === '/login') {
          console.log('Authenticated user on login page, redirecting to dashboard');
          await router.replace('/dashboard');
        }
      } else {
        if (pathname !== '/login') {
          console.log('Unauthenticated user, redirecting to login');
          await router.replace('/login');
        }
      }
    };

    handleRouting();
  }, [user, pathname, isAuthChecked, isInitialized, router]);

  // 초기 로딩 상태
  if (!isAuthChecked || !isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">
        {children}
      </main>
      <BottomNavigation />
    </div>
  );
} 