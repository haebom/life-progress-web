'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { initPushNotifications, removePushNotificationListeners } from '@/lib/pushNotifications';
import { BottomNavigation } from '@/components/BottomNavigation';
import { Firebase } from '@/lib/firebase';
import useStore from '@/store/useStore';
import type { User as FirebaseUser } from 'firebase/auth';

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
  const [isLoading, setIsLoading] = useState(true);

  // 사용자 데이터 가져오기
  const fetchUserDataAndUpdate = useCallback(async (firebaseUser: FirebaseUser) => {
    try {
      const userData = await Firebase.fetchUserData(firebaseUser.uid);
      console.log('Firestore 사용자 데이터:', {
        exists: !!userData,
        email: userData?.email,
        uid: firebaseUser.uid
      });
      return userData;
    } catch (error) {
      console.error('Firestore 데이터 요청 오류:', error);
      return null;
    }
  }, []);

  // 인증 상태 변경 처리
  const handleAuthStateChange = useCallback(async (firebaseUser: FirebaseUser | null) => {
    console.log('Auth State Changed:', {
      isAuthenticated: !!firebaseUser,
      email: firebaseUser?.email,
      pathname
    });

    try {
      if (firebaseUser) {
        const userData = await fetchUserDataAndUpdate(firebaseUser);
        setUser(userData);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('인증 상태 처리 오류:', error);
      setUser(null);
    } finally {
      setIsAuthChecked(true);
      setIsLoading(false);
    }
  }, [fetchUserDataAndUpdate, setUser, pathname]);

  // 라우팅 처리
  const handleRouting = useCallback(async () => {
    if (!isAuthChecked || isLoading) return;

    console.log('Routing Check:', {
      isAuthenticated: !!user,
      email: user?.email,
      pathname,
      isAuthChecked,
      isInitialized
    });

    if (!isInitialized) {
      setIsInitialized(true);
      return;
    }

    try {
      if (user) {
        if (pathname === '/login') {
          console.log('인증된 사용자: 대시보드로 이동');
          await router.replace('/dashboard');
        }
      } else {
        if (pathname !== '/login') {
          console.log('미인증 사용자: 로그인 페이지로 이동');
          await router.replace('/login');
        }
      }
    } catch (error) {
      console.error('라우팅 처리 오류:', error);
    }
  }, [user, pathname, isAuthChecked, isInitialized, isLoading, router]);

  // 푸시 알림 초기화
  useEffect(() => {
    initPushNotifications();
    return () => {
      removePushNotificationListeners();
    };
  }, []);

  // 인증 상태 감지
  useEffect(() => {
    console.log('인증 상태 감지 설정');
    const unsubscribe = Firebase.initializeAuth(handleAuthStateChange);

    return () => {
      console.log('인증 상태 감지 정리');
      unsubscribe();
    };
  }, [handleAuthStateChange]);

  // 라우팅 처리
  useEffect(() => {
    handleRouting();
  }, [handleRouting]);

  // 로딩 상태 표시
  if (isLoading || !isAuthChecked || !isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
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