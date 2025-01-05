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
  const [authState, setAuthState] = useState<{
    isInitialized: boolean;
    isAuthChecked: boolean;
    isLoading: boolean;
    lastRedirectPath: string | null;
  }>({
    isInitialized: false,
    isAuthChecked: false,
    isLoading: true,
    lastRedirectPath: null,
  });
  const redirectInProgress = useRef(false);

  // 렌더링 상태 로깅
  useEffect(() => {
    console.log('[Layout] 렌더링 상태:', {
      authState,
      pathname,
      user: user?.email,
      redirectInProgress: redirectInProgress.current
    });
  }, [authState, pathname, user]);

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
        uid: firebaseUser.uid,
        pathname
      });
      return userData;
    } catch (error) {
      console.error('[Auth] Firestore 데이터 요청 오류:', error);
      return null;
    }
  }, [pathname]);

  // 인증 상태 변경 처리
  const handleAuthStateChange = useCallback(async (firebaseUser: FirebaseUser | null) => {
    console.log('[Auth] 상태 변경:', {
      isAuthenticated: !!firebaseUser,
      email: firebaseUser?.email,
      pathname,
      authState
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
      setAuthState(prev => ({
        ...prev,
        isAuthChecked: true,
        isLoading: false,
        isInitialized: true
      }));
    }
  }, [fetchUserDataAndUpdate, setUser, pathname, authState]);

  // 라우팅 처리
  const handleRouting = useCallback(async () => {
    const { isAuthChecked, isLoading, lastRedirectPath } = authState;

    // 초기화 전이거나 리다이렉션이 진행 중이면 처리하지 않음
    if (!isAuthChecked || isLoading || redirectInProgress.current) {
      return;
    }

    // 이전 리다이렉션 경로와 현재 경로가 같으면 처리하지 않음
    if (lastRedirectPath === pathname) {
      return;
    }

    console.log('[Routing] 상태 확인:', {
      isAuthenticated: !!user,
      email: user?.email,
      pathname,
      authState,
      redirectInProgress: redirectInProgress.current
    });

    try {
      redirectInProgress.current = true;
      const currentIsPublic = isPublicRoute(pathname);

      // 인증된 사용자가 공개 경로에 접근
      if (user && currentIsPublic) {
        console.log('[Routing] 인증된 사용자를 대시보드로 이동');
        setAuthState(prev => ({ ...prev, lastRedirectPath: '/dashboard' }));
        await router.replace('/dashboard');
        return;
      }

      // 미인증 사용자가 비공개 경로에 접근
      if (!user && !currentIsPublic) {
        console.log('[Routing] 미인증 사용자를 로그인으로 이동');
        setAuthState(prev => ({ ...prev, lastRedirectPath: '/login' }));
        await router.replace('/login');
        return;
      }
    } catch (error) {
      console.error('[Routing] 처리 오류:', error);
    } finally {
      redirectInProgress.current = false;
    }
  }, [user, pathname, authState, router, isPublicRoute]);

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

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 relative">
        {children}
        {/* 로딩 오버레이 */}
        {(authState.isLoading || !authState.isAuthChecked) && (
          <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 flex items-center justify-center z-50">
            <div className="flex flex-col items-center gap-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {authState.isLoading ? '로딩 중...' : '인증 확인 중...'}
              </p>
            </div>
          </div>
        )}
      </main>
      <BottomNavigation />
    </div>
  );
} 