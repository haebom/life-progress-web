'use client';

import { useEffect } from 'react';
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
  const { setUser } = useStore();

  useEffect(() => {
    initPushNotifications();
    return () => {
      removePushNotificationListeners();
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const unsubscribe = Firebase.initializeAuth(async (firebaseUser) => {
      if (!isMounted) return;

      if (firebaseUser) {
        try {
          const userData = await Firebase.fetchUserData(firebaseUser.uid);
          if (!isMounted) return;

          if (userData) {
            setUser(userData);
            if (pathname === '/login') {
              setTimeout(() => {
                if (isMounted) {
                  router.replace('/dashboard');
                }
              }, 100);
            }
          } else {
            setUser(null);
            if (pathname !== '/login') {
              router.replace('/login');
            }
          }
        } catch (error) {
          console.error('사용자 데이터 로딩 오류:', error);
          if (!isMounted) return;
          setUser(null);
          if (pathname !== '/login') {
            router.replace('/login');
          }
        }
      } else {
        setUser(null);
        if (pathname !== '/login') {
          router.replace('/login');
        }
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [setUser, router, pathname]);

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">
        {children}
      </main>
      <BottomNavigation />
    </div>
  );
} 