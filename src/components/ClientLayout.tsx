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

      console.log('Auth State Changed:', { firebaseUser: firebaseUser?.email, pathname });

      if (firebaseUser) {
        try {
          const userData = await Firebase.fetchUserData(firebaseUser.uid);
          console.log('User Data Fetched:', { userData: userData?.email, pathname });

          if (!isMounted) return;

          if (userData) {
            setUser(userData);
            if (pathname === '/login') {
              console.log('Redirecting to dashboard...');
              try {
                await router.push('/dashboard');
                console.log('Redirect successful');
              } catch (error) {
                console.error('Redirect failed:', error);
              }
            }
          } else {
            console.log('No user data found, redirecting to login');
            setUser(null);
            if (pathname !== '/login') {
              router.push('/login');
            }
          }
        } catch (error) {
          console.error('사용자 데이터 로딩 오류:', error);
          if (!isMounted) return;
          setUser(null);
          if (pathname !== '/login') {
            router.push('/login');
          }
        }
      } else {
        console.log('No firebase user, redirecting to login');
        setUser(null);
        if (pathname !== '/login') {
          router.push('/login');
        }
      }
    });

    return () => {
      console.log('Cleanup: Unsubscribing from auth state');
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