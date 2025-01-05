'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
  const { setUser } = useStore();

  useEffect(() => {
    initPushNotifications();
    return () => {
      removePushNotificationListeners();
    };
  }, []);

  useEffect(() => {
    const unsubscribe = Firebase.initializeAuth(async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userData = await Firebase.fetchUserData(firebaseUser.uid);
          if (userData) {
            setUser(userData);
            if (window.location.pathname === '/login') {
              router.push('/dashboard');
            }
          } else {
            setUser(null);
            if (window.location.pathname !== '/login') {
              router.push('/login');
            }
          }
        } catch (error) {
          console.error('사용자 데이터 로딩 오류:', error);
          setUser(null);
        }
      } else {
        setUser(null);
        if (window.location.pathname !== '/login') {
          router.push('/login');
        }
      }
    });

    return () => unsubscribe();
  }, [setUser, router]);

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">
        {children}
      </main>
      <BottomNavigation />
    </div>
  );
} 