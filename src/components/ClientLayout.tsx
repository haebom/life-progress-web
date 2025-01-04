'use client';

import { useEffect } from 'react';
import { initPushNotifications, removePushNotificationListeners } from '@/lib/pushNotifications';
import { BottomNavigation } from '@/components/BottomNavigation';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    initPushNotifications();
    return () => {
      removePushNotificationListeners();
    };
  }, []);

  return (
    <>
      <main className="pb-16">
        {children}
      </main>
      <BottomNavigation />
    </>
  );
} 