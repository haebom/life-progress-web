'use client';

import { useEffect } from 'react';
import { initPushNotifications, removePushNotificationListeners } from '@/lib/pushNotifications';
import { Inter } from 'next/font/google';
import { BottomNavigation } from '@/components/BottomNavigation';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Life Progress',
  description: '인생의 진행도를 시각화하고 목표를 관리하세요',
};

export default function RootLayout({
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
    <html lang="ko">
      <body className={inter.className}>
        <main className="pb-16">
          {children}
        </main>
        <BottomNavigation />
      </body>
    </html>
  );
}
