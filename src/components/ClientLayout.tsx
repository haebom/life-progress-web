'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { initPushNotifications, removePushNotificationListeners } from '@/lib/pushNotifications';
import { BottomNavigation } from '@/components/BottomNavigation';
import { Firebase } from '@/lib/firebase';
import useStore from '@/store/useStore';
import type { User as FirebaseUser } from 'firebase/auth';

const PUBLIC_ROUTES = ['/login', '/signup', '/forgot-password'];

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
  const redirectInProgress = useRef(false);

  // 현재 경로가 공개 경로인지 확인
  const isPublicRoute = useCallback((path: string) => {
    return PUBLIC_ROUTES.includes(path);
  }, []);

  // 사용자 데이터 가져오기
  const fetchUserDataAndUpdate = useCallback(async (firebaseUser: FirebaseUser) => {
    try {
      const userData = await Firebase.fetchUserData(firebaseUser.uid);
      console.log('[Auth] Firestore 사용자 데이터:', {
        exists: !!userData,
        email: userData?.email,
        uid: firebaseUser.uid
      });
      return userData;
    } catch (error) {
      console.error('[Auth] Firestore 데이터 요청 오류:', error);
      return null;
    }
  }, []);

  // 인증 상태 변경 처리
  const handleAuthStateChange = useCallback(async (firebaseUser: FirebaseUser | null) => {
    console.log('[Auth] 상태 변경:', {
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
      console.error('[Auth] 상태 처리 오류:', error);
      setUser(null);
    } finally {
      if (!isAuthChecked) {
        setIsAuthChecked(true);
      }
      setIsLoading(false);
    }
  }, [fetchUserDataAndUpdate, setUser, pathname, isAuthChecked]);

  // 라우팅 처리
  const handleRouting = useCallback(async () => {
    // 초기화 전이거나 리다이렉션이 진행 중이면 처리하지 않음
    if (!isAuthChecked || isLoading || redirectInProgress.current) {
      return;
    }

    console.log('[Routing] 상태 확인:', {
      isAuthenticated: !!user,
      email: user?.email,
      pathname,
      isAuthChecked,
      isInitialized,
      redirectInProgress: redirectInProgress.current
    });

    if (!isInitialized) {
      setIsInitialized(true);
      return;
    }

    try {
      redirectInProgress.current = true;

      const currentIsPublic = isPublicRoute(pathname);

      if (user) {
        // 인증된 사용자가 공개 경로에 접근하면 대시보드로 이동
        if (currentIsPublic) {
          console.log('[Routing] 인증된 사용자를 대시보드로 이동');
          await router.replace('/dashboard');
        }
      } else {
        // 미인증 사용자가 비공개 경로에 접근하면 로그인으로 이동
        if (!currentIsPublic) {
          console.log('[Routing] 미인증 사용자를 로그인으로 이동');
          await router.replace('/login');
        }
      }
    } catch (error) {
      console.error('[Routing] 처리 오류:', error);
    } finally {
      redirectInProgress.current = false;
    }
  }, [user, pathname, isAuthChecked, isInitialized, isLoading, router, isPublicRoute]);

  // 푸시 알림 초기화
  useEffect(() => {
    initPushNotifications();
    return () => {
      removePushNotificationListeners();
    };
  }, []);

  // 인증 상태 감지
  useEffect(() => {
    console.log('[Auth] 상태 감지 설정');
    const unsubscribe = Firebase.initializeAuth(handleAuthStateChange);

    return () => {
      console.log('[Auth] 상태 감지 정리');
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