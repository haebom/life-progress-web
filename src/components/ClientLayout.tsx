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
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">
        {children}
      </main>
      <BottomNavigation />
    </div>
  );
} 