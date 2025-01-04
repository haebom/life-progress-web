'use client';

import { Inter } from 'next/font/google';
import { BottomNavigation } from '@/components/BottomNavigation';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <head>
        <title>Life Progress</title>
        <meta name="description" content="인생의 진행도를 시각화하고 목표를 관리하세요" />
      </head>
      <body className={inter.className}>
        <main className="pb-16">
          {children}
        </main>
        <BottomNavigation />
      </body>
    </html>
  );
}
