'use client';

import { useEffect } from 'react';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/Toaster';
import { useAuthStore } from '@/store/auth';
import { Firebase } from '@/lib/firebase';
import { isInAppBrowser, isSafariBrowser } from '@/utils/browser';
import { onAuthStateChanged } from 'firebase/auth';

interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const { setUser, setInAppBrowser, setSafari } = useAuthStore();

  useEffect(() => {
    // 브라우저 환경 감지
    setInAppBrowser(isInAppBrowser());
    setSafari(isSafariBrowser());

    // 인증 상태 초기화
    const unsubscribe = onAuthStateChanged(Firebase.auth, async (user) => {
      if (user) {
        const userData = await Firebase.fetchUserData(user.uid);
        if (userData) {
          setUser({ ...user, ...userData });
        }
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, [setUser, setInAppBrowser, setSafari]);

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
      <Toaster />
    </ThemeProvider>
  );
} 